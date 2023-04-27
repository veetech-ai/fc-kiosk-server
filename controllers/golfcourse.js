exports.register = (req, res) => {
    /**
     * @swagger
     *
     * /user/register:
     *   post:
     *     security: []
     *     description: Register
     *     tags: [User]
     *     consumes:
     *       - application/x-www-form-urlencoded
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: name
     *         description: Name of user
     *         in: formData
     *         required: true
     *         type: string
     *       - name: email
     *         description: Email of user
     *         in: formData
     *         required: true
     *         type: string
     *       - name: password
     *         description: User's password.
     *         in: formData
     *         required: true
     *         type: string
     *       - name: password_confirmation
     *         description: User's confirm password.
     *         in: formData
     *         required: true
     *         type: string
     *       - name: phone
     *         description: User's phone number.
     *         in: formData
     *         required: true
     *         type: string
     *     responses:
     *       200:
     *         description: success
     */
    try {
      const validation = new Validator(req.body, {
        name: "required",
        email: "required|email",
        password: "required|confirmed",
        password_confirmation: "required",
        phone: ["required", `regex:${helper.PhoneRegex}`],
      });
  
      validation.fails(function () {
        return apiResponse.fail(res, validation.errors);
      });
  
      validation.passes(async function () {
        try {
          const password = await helper.setPassword(req.body.password);
  
          req.body.password = password;
          const token = helper.generate_verify_token();
          req.body.email_token = req.body.invitation_token ? null : token;
          req.body.status = req.body.invitation_token ? 1 : 0;
          req.body.mqtt_token = helper.generate_token(10);
          const email_code = helper.generate_random_string({ length: 10 });
          req.body.email_code = email_code;
  
          const created_user = await UserModel.create_user(req.body);
  
          if (!req.body.invitation_token) {
            created_user.order_id = req.body.order_id || false;
            await email.send_registration_email(created_user, token, email_code);
  
            return apiResponse.success(res, req, created_user);
          }
  
          const invited_user = await UserInvitations.find_by_token(
            req.body.invitation_token,
          );
  
          if (!invited_user) return apiResponse.fail(res, "Invalid token", 422);
  
          await UserInvitations.update(invited_user.id, {
            invitation_token: null,
          });
  
          if (invited_user.invite_from == "sharing device") {
            await UserDeviceModel.verify_shared_token_by_invitation(
              req.body.invitation_token,
              created_user.id,
            );
          } else if (invited_user.invite_from == "transfer device") {
            await DeviceModel.verify_transfer_token({
              token: req.body.invitation_token,
              invited_user_id: created_user.id,
              action: true,
            });
          }
  
          return apiResponse.success(res, req, created_user);
        } catch (err) {
          if (err.message == "emailExists")
            return apiResponse.fail(res, "Email already exists", 422);
          else return apiResponse.fail(res, err.message, 500);
        }
      });
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  };