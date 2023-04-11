const helper = require("../../../helper");
const { User, User_Invitations } = require("../../../../models");
const bcrypt = require("bcryptjs");
const { products } = require("../../../../common/products");

describe("List All Users", () => {
  let tokens;
  let deviceId = 1;
  const ORG_ID = 1;
  const USER_ID = 1;
  const CARD_SERIAL = `123654`;

  beforeAll(async () => {
    tokens = await helper.get_all_roles_tokens();

    // Creating the Device and getting its Id
    const response = await helper.post_request_with_authorization({
      endpoint: "device/create",
      token: tokens.admin,
      params: {
        serial: Date.now().toString(),
        pin_code: "1111",
        device_type: products.kiosk.id,
      },
    });

    expect(response.status).toEqual(200);
    expect(response.body.data).toBeTruthy();

    deviceId = response.body.data.id;
  });

  describe("GET: /all", () => {
    describe("Success", () => {
      it("should get all users", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/all",
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeTruthy();
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
    // describe("Failure", () => {});
  });

  describe("GET: /all/<organization>", () => {
    describe("Success", () => {
      it("should get all users of a particular organization", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/all/" + ORG_ID,
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeTruthy();
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });

      it("should get minimal data of users of a particular organization", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/all/" + ORG_ID,
          token: tokens.admin,
          queryParams: {
            minimal: true,
          },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toBeTruthy();
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
        expect(Object.keys(response.body.data[0])).toStrictEqual([
          "id",
          "name",
          "cardSerial",
        ]);
      });
      it("should return the expected fields only", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/all/" + ORG_ID,
          token: tokens.admin,
        });

        const expectedResponseKeys = [
          "first_name",
          "last_name",
          "id",
          "name",
          "email",
          "phone",
          "is_admin",
          "status",
          "profile_image",
          "advance_user",
          "mqtt_token",
          "super_admin",
          "pn_status",
          "phone_code",
          "phone_verified",
          "fb_id",
          "g_id",
          "tw_id",
          "email_code",
          "orgId",
          "cardSerial",
          "roleId",
          "reportTo",
          "createdAt",
          "updatedAt",
          "role_id",
          "Organization",
          "Role",
        ];

        console.log(response.body.data);
        expect(Object.keys(response.body.data[0])).toEqual(
          expectedResponseKeys,
        );
        expect(response.status).toEqual(200);
      });
    });
    // describe("Failure", () => {});
  });

  describe("GET: /user/count/<organizationId>", () => {
    describe("Success", () => {
      it("should get count of all users of a particular organization", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/count/" + ORG_ID,
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.count).toBeGreaterThanOrEqual(0);

        expect(response.body.data.userIds).toBeTruthy();
        expect(response.body.data.userIds.length).toBeGreaterThanOrEqual(0);
      });
    });
    // describe("Failure", () => {});
  });

  describe("GET: /user/all/active", () => {
    describe("Success", () => {
      it("should get list of all active users", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/all/active",
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
    // describe("Failure", () => {});
  });

  describe("GET: /user/selective/<ids>", () => {
    describe("Success", () => {
      it("should get count of all users of a selective organizations", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/selective/1,5",
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.length).toEqual(2);
      });
    });
    // describe("Failure", () => {});
  });

  describe("GET: /user/org/all/<cardSerial>/<orgId>", () => {
    describe("Success", () => {
      it("should get all users of a particular organization and card serial", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/org/all/${CARD_SERIAL}/${ORG_ID}`,
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
    // describe("Failure", () => {});
  });

  describe("GET: /user/card/<cardSerial>/<deviceId>", () => {
    describe("Success", () => {
      it("should get a user of a particular organization without deviceId as ceo", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/card/${CARD_SERIAL}/${deviceId}`,
          token: tokens.ceo,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).not.toBeNull();
        expect(response.body.data.cardSerial).toBe(CARD_SERIAL);
      });

      it("should get a user of a particular organization with deviceId as admin", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/card/${CARD_SERIAL}/${deviceId}`,
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).not.toBeNull();
        expect(response.body.data.cardSerial).toBe(CARD_SERIAL);
      });
    });

    describe("Failure", () => {
      it("should send error message if deviceId is not sent user is admin", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/card/${CARD_SERIAL}/`,
          token: tokens.admin,
        });

        expect(response.status).toEqual(500);
        expect(response.body.success).toEqual(false);
        expect(response.body.data).toEqual(
          "deviceId is required in path params if user is admin",
        );
      });

      it("should send error message if deviceId is not a number", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/card/${CARD_SERIAL}/invalid_device_id`,
          token: tokens.admin,
        });

        expect(response.status).toEqual(500);
        expect(response.body.success).toEqual(false);
        expect(response.body.data).toEqual(
          "deviceId should be a numeric value",
        );
      });

      it("should send error message if no user is found", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/card/${CARD_SERIAL}/`,
          token: tokens.zongCustomer,
        });

        expect(response.status).toEqual(400);
        expect(response.body.success).toEqual(false);
        expect(response.body.data).toEqual("User not found");
      });

      it("should send error message if no device is found against given id", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: `user/card/${CARD_SERIAL}/20`,
          token: tokens.admin,
        });

        expect(response.status).toEqual(500);
        expect(response.body.success).toEqual(false);
        expect(response.body.data).toEqual("No device found with provided id");
      });
    });
  });

  describe("GET: /user/get/<userId>", () => {
    describe("Success", () => {
      it("should get all users of a particular organization and card serial", async () => {
        const userId = 2032;

        const response = await helper.get_request_with_authorization({
          endpoint: `user/get/${userId}`,
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.id).toEqual(userId);
        expect(response.body.data.cardSerial).toEqual("0000000000");
      });
    });
    // describe("Failure", () => {});
  });

  describe("PUT: /user/card/<userId>/<cardSerial>", () => {
    describe("Success", () => {
      it("should update the user in particular organization", async () => {
        const userId = 6;
        const newCardSerial = "123456";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${userId}/${newCardSerial}`,
          token: tokens.ceo,
        });

        expect(response.status).toEqual(200);
        expect(response.body.success).toEqual(true);
        expect(response.body.data).toEqual(
          "User card Serial updated successfully",
        );
      });
    });

    describe("Failure", () => {
      it("should send error if device id is not number like", async () => {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${USER_ID}/${CARD_SERIAL}`,
          token: tokens.admin,
          params: {
            deviceId: "invalid_id",
          },
        });

        expect(response.status).toEqual(500);
        expect(response.body.data).toEqual(
          "deviceId should be a numeric value",
        );
      });

      it("should send error if device id is not sent", async () => {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${USER_ID}/${CARD_SERIAL}`,
          token: tokens.admin,
          params: {},
        });

        expect(response.status).toEqual(500);
        expect(response.body.data).toEqual(
          "deviceId is required in body if user is admin",
        );
      });

      it("should send error if device with given id is not found", async () => {
        const response = await helper.put_request_with_authorization({
          endpoint: `user/card/${USER_ID}/${CARD_SERIAL}`,
          token: tokens.admin,
          params: {
            deviceId: 132,
          },
        });

        expect(response.status).toEqual(500);
        expect(response.body.data).toEqual("No device found with provided id");
      });
    });
  });

  describe("PUT: /user/update/profile", () => {
    describe("Success", () => {
      it("should get all users of a particular organization and card serial", async () => {
        const phone = "+923211234567";
        const name = "operator account";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/profile`,
          token: tokens.admin,
          params: { name, phone },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual("User Updated Successfully");

        // check if record in database is updated
        const { dataValues } = await User.findOne({ where: { name } });

        expect(dataValues.phone).toEqual(phone);
      });
    });

    describe("Failure", () => {
      it("should send error if name is in invalid format", async () => {
        const phone = "+923211234567";
        const name = "$123_#";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/profile`,
          token: tokens.admin,
          params: { name, phone },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data.errors.name).toHaveLength(1);
        expect(response.body.data.errors.name[0]).toEqual(
          "The name format is invalid.",
        );
      });

      it("should send error if phone is in invalid format", async () => {
        const phone = "132456789";
        const name = "operator account";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/profile`,
          token: tokens.admin,
          params: { name, phone },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data.errors.phone).toHaveLength(1);
        expect(response.body.data.errors.phone[0]).toEqual(
          "The phone format is invalid.",
        );
      });

      // it("should send error if user is not found", async () => {
      //   const phone = "+923211234567";
      //   const name = "aka MR X";

      //   const response = await helper.put_request_with_authorization({
      //     endpoint: `user/update/profile`,
      //     token: tokens.admin,
      //     params: { name, phone },
      //   });

      //   expect(response.status).toEqual(404);
      //   expect(response.body.data).toEqual("User not found");

      //
      // });
    });
  });

  describe("PUT: /user/update/<userId>", () => {
    describe("Success", () => {
      it("should update the user with given id", async () => {
        const name = "Admin";
        const phone = "+923211234567";
        const role = "Customer";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${USER_ID}`,
          token: tokens.superadmin,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(200);
      });
    });
    describe("Failure", () => {
      it("should send error if name is not in valid format", async () => {
        const name = "$abd_123";
        const phone = "+923211234567";
        const role = "customer";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${USER_ID}`,
          token: tokens.superadmin,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data.errors).toStrictEqual({
          name: ["The name format is invalid."],
        });
      });

      it("should send error if phone is not in valid format", async () => {
        const name = "Admin";
        const phone = "123456879";
        const role = "customer";

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${USER_ID}`,
          token: tokens.superadmin,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data.errors).toStrictEqual({
          phone: ["The phone format is invalid."],
        });
      });

      it("should send error if role is not in valid format", async () => {
        const name = "Admin";
        const phone = "+923211234567";
        const role = 123456789;

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${USER_ID}`,
          token: tokens.superadmin,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data.errors).toEqual({
          role: ["The role must be a string."],
        });
      });

      it("should send error if user is not found", async () => {
        const name = "Admin";
        const phone = "+923211234567";
        const role = "customer";
        const invalidId = 9989;

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${invalidId}`,
          token: tokens.superadmin,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(404);
        expect(response.body.data).toEqual("User not found");
      });

      it("should send error if role is not found", async () => {
        const name = "Admin";
        const phone = "+923211234567";
        const role = "INVALID_ROLE";

        const response = await helper.put_request_with_authorization({
          endpoint: "user/update/1",
          token: tokens.superadmin,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(404);
        expect(response.body.data).toEqual("Role not found");
      });

      it("should send error if user is not admin & updating user of other organization", async () => {
        const name = "Test Organization Operator account";
        const phone = "+923211234567";
        const role = "customer";
        const userId = 2032;

        const response = await helper.put_request_with_authorization({
          endpoint: `user/update/${userId}`,
          token: tokens.testCustomer,
          params: { name, phone, role },
        });

        expect(response.status).toEqual(403);

        expect(response.body.data).toEqual(
          "You cannot update user of other organization",
        );
      });
    });
  });

  describe("PUT: /user/push-notification-permission", () => {
    describe("Success", () => {
      it("should update the push notification persmissions", async () => {
        const response = await helper.put_request_with_authorization({
          endpoint: "user/push-notification-permission",
          token: tokens.admin,
          params: {
            pn_status: true,
          },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual("User Updated Successfully");

        const response1 = await helper.put_request_with_authorization({
          endpoint: "user/push-notification-permission",
          token: tokens.admin,
          params: {
            pn_status: false,
          },
        });

        expect(response1.status).toEqual(200);
        expect(response1.body.data).toEqual("User Updated Successfully");
      });
    });
    describe("Failure", () => {
      it("should send error if pn_status is not provided", async () => {
        const response = await helper.put_request_with_authorization({
          endpoint: "user/push-notification-permission",
          token: tokens.admin,
          params: {},
        });

        expect(response.status).toEqual(400);
        expect(response.body.data).toStrictEqual({
          errors: { pn_status: ["The pn status field is required."] },
        });
      });

      it("should send error if pn_status is of invalid type", async () => {
        const response = await helper.put_request_with_authorization({
          endpoint: "user/push-notification-permission",
          token: tokens.admin,
          params: {
            pn_status: "this is invalid pn_status",
          },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data).toStrictEqual({
          errors: { pn_status: ["pn status must be a boolean"] },
        });
      });

      // it("should send error if user is not found", async () => {});
    });
  });

  describe("POST: /user/change-password", () => {
    describe("Success", () => {
      it("should change user password", async () => {
        const userFormData = {
          password: "123456",
          newPassword: "1234567890qwerty",
          userId: 6,
        };

        const user = await User.findByPk(userFormData.userId, {
          attributes: ["password", "id"],
        });

        const passMatch = bcrypt.compareSync(
          userFormData.password,
          user.password,
        );
        expect(passMatch).toEqual(true);

        // now hit the endpoint to update his password
        const response = await helper.post_request_with_authorization({
          endpoint: "user/change-password",
          token: tokens.testOperator,
          params: {
            old_password: userFormData.password,
            new_password: userFormData.newPassword,
            new_password_confirmation: userFormData.newPassword,
          },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual("Password Changed");

        const updatedUser = await User.findByPk(userFormData.userId, {
          attributes: ["password"],
        });

        const newPassMatch = bcrypt.compareSync(
          userFormData.newPassword,
          updatedUser.password,
        );
        expect(newPassMatch).toEqual(true);

        // revert password back, to make sure other test cases won't fail
        await User.update(
          { password: user.password },
          { where: { id: user.id } },
        );
      });
    });
    // describe("Failure", () => {});
  });

  describe("POST: /user/set-password", () => {
    describe("Success", () => {
      it("should set user password", async () => {
        const userFormData = {
          password: "123456",
          newPassword: "1234567890qwerty",
          userId: 7,
          passwordToken: "secret-password-reset-token",
        };

        // add password token for particular user
        await User.update(
          { password_token: userFormData.passwordToken },
          { where: { id: userFormData.userId } /* returning: true*/ },
        );

        const user = await User.findByPk(userFormData.userId, {
          attributes: ["password", "id"],
        }); // returning:true not working for me for some reason

        // verify current password
        const passMatch = bcrypt.compareSync(
          userFormData.password,
          user.password,
        );

        expect(passMatch).toEqual(true);

        // now hit the endpoint to update his password
        const response = await helper.post_request_with_authorization({
          endpoint: "user/set-password",
          token: tokens.testOperator,
          params: {
            password_token: userFormData.passwordToken,
            new_password: userFormData.newPassword,
            new_password_confirmation: userFormData.newPassword,
          },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual("Password Changed");

        const updatedUser = await User.findByPk(userFormData.userId, {
          attributes: ["password"],
        });

        // verify updated password
        const newPassMatch = bcrypt.compareSync(
          userFormData.newPassword,
          updatedUser.password,
        );
        expect(newPassMatch).toEqual(true);

        // do cleanup, to make sure other test cases won't fail
        await User.update(
          { password: user.password, password_token: null },
          { where: { id: user.id } },
        );
      });
    });

    describe("Failure", () => {
      it("should send error if password_token is missing in req payload", async () => {
        const userFormData = {
          password: "123456",
          newPassword: "1234567890qwerty",
        };

        const response = await helper.post_request_with_authorization({
          endpoint: "user/set-password",
          token: tokens.testOperator,
          params: {
            new_password: userFormData.newPassword,
            new_password_confirmation: userFormData.newPassword,
          },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data).toStrictEqual({
          errors: { password_token: ["The password token field is required."] },
        });
      });

      it("should send error if password_token is not in database", async () => {
        const userFormData = {
          password: "123456",
          newPassword: "1234567890qwerty",
          userId: 7,
          passwordToken: "secret-password-reset-token",
        };

        const response = await helper.post_request_with_authorization({
          endpoint: "user/set-password",
          token: tokens.testOperator,
          params: {
            password_token: userFormData.passwordToken,
            new_password: userFormData.newPassword,
            new_password_confirmation: userFormData.newPassword,
          },
        });

        expect(response.status).toEqual(422);
        expect(response.body.data).toEqual("Invalid token");
      });
    });
  });

  // ? Need to discuss the functionality
  describe("GET: /user/verify-invite-token", () => {
    describe("Success", () => {
      it("should verify if token is valid", async () => {
        // insert email_token for certain user
        const emailToken = "secret_email_token";
        const userFormData = {
          emailToken: "secret_email_token",
          email: "new-user@mail.com",
          inviteFrom: ["sharing device", "transfer device"],
          userId: 6,
        };

        const invitingUser = await User.findByPk(userFormData.userId);

        await User_Invitations.create({
          invitation_token: emailToken,
          invite_by_user: invitingUser.id,
          email: invitingUser.email,
        });

        const response = await helper.get_request_with_authorization({
          endpoint: "user/verify-invite-token",
          token: tokens.testOperator,
          queryParams: {
            token: emailToken,
          },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data).toEqual("no_form_need");
      });
    });

    describe("Failure", () => {
      it("should send error if token is not sent in request payload", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/verify-invite-token",
          token: tokens.testOperator,
          queryParams: {},
        });

        expect(response.status).toEqual(401);
        expect(response.body.data).toEqual(
          "Invalid link. Or link may be expire",
        );
      });

      it("should send error if token is not in database", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/verify-invite-token",
          token: tokens.testOperator,
          queryParams: {
            token: "this_token_is_not_in_db",
          },
        });

        expect(response.status).toEqual(422);
        expect(response.body.data).toEqual("Invalid token");
      });
    });
  });

  // ? Need to discuss the functionality
  describe("GET: /user/ownership-requests", () => {
    describe("Success", () => {
      it("should get all ownership records", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/ownership-requests",
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.length).toBeGreaterThanOrEqual(0);
      });
    });
  });

  // ? Need to discuss the functionality
  describe("POST: /user/share-requests", () => {
    describe("Success", () => {});
    describe("Failure", () => {});
  });

  describe("GET: /user/get-user-settings", () => {
    describe("Success", () => {
      it("should get user settings", async () => {
        const response = await helper.get_request_with_authorization({
          endpoint: "user/get-user-settings",
          token: tokens.admin,
        });

        expect(response.status).toEqual(200);
        expect(response.body).toHaveProperty("data");
      });
    });
  });

  describe("POST: /user/set-user-settings", () => {
    describe("Success", () => {
      it("should set user settings", async () => {
        const setting = JSON.stringify({ setting1: "dummy_set" });
        const response = await helper.post_request_with_authorization({
          endpoint: "user/set-user-settings",
          token: tokens.admin,
          params: {
            config: setting,
          },
        });

        expect(response.status).toEqual(200);
        expect(response.body.data.config).toStrictEqual(JSON.parse(setting));
      });
    });
    describe("Failure", () => {
      it("should send error if setting is not in payload", async () => {
        const response = await helper.post_request_with_authorization({
          endpoint: "user/set-user-settings",
          token: tokens.admin,
          params: {},
        });

        expect(response.status).toEqual(400);
        expect(response.body.data).toStrictEqual({
          errors: { config: ["The config field is required."] },
        });
      });
      it("should send error if setting is not JSON string", async () => {
        const setting = { setting1: "dummy_set" };
        const response = await helper.post_request_with_authorization({
          endpoint: "user/set-user-settings",
          token: tokens.admin,
          params: {
            config: setting,
          },
        });

        expect(response.status).toEqual(400);
        expect(response.body.data).toStrictEqual({
          errors: { config: ["The config must be JSON string"] },
        });
      });
    });
  });

  //   describe("POST: /user/send-phone-verification-code", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("POST: /user/verify-phone-verification-code", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("POST: /user/login-info", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("POST: /user/verify-account", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("GET: /user/get-all-unverified-account", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("POST: /user/complete-registeration", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("PUT: /user/all/assign-role", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("GET: /user/verify-email-invite-token", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("GET: /user/people-matrics-logs", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });

  //   describe("/user/email-token/<email>", () => {
  //     describe("Success", () => {});
  //     describe("Failure", () => {});
  //   });
});
