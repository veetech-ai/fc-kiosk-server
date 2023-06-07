// External Imports
const formidable = require("formidable");
const Validator = require("validatorjs");

// Model Imports
const models = require("../../models");

// Services Imports
const UserModel = require("../../services/user");
const DeviceModel = require("../../services/device");
const UserDeviceModel = require("../../services/user_device");
const RoleModel = require("../../services/role");
const UserInvitations = require("../../services/user_invitations");
const UserSettings = require("../../services/user_settings");
const UserLoginInfoModel = require("../../services/user_login_info");
const PushNotificationsSubscriptionsModel = require("../../services/push_notifications_subscriptions");
const UserSQAnswerModel = require("../../services/user_sq_answers");
const OtpModel = require("../../services/otp");
const clubService = require("../../services/mobile/clubs");
const gameService = require("../../services/mobile/game");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const email = require("../../common/email");
const upload_file = require("../../common/upload");
const { roleWithAuthorities } = require("../../common/roles_with_authorities");

// Configuration Imports
const config = require("../../config/config");

// IOT Core Imports
const rolesSchema = require("../../df-commons/data/roles.json");
const UsersStatus = UserModel.UsersStatus;

const {
  isOverWrite,
  send_password_reset_email,
  get_user_auth_tokens,
} = require("./helper");

/**
 * @swagger
 * tags:
 *   name: User
 *   description: User management
 */

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

exports.list = async (req, res) => {
  /**
   * @swagger
   *
   * /user/all:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all user (Only Admin)
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const result = await UserModel.list(
      helper.get_pagination_params(req.query),
    );

    return apiResponse.pagination(res, req, result.data, result.count);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.listByOrganizationId = async (req, res) => {
  /**
   * @swagger
   *
   * /user/all/{organizationId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all users based upon the organization id (Admin Or Super Admin)
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: organizationId
   *         description: organization ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: minimal
   *         description: boolean, in response send only "id","name","cardSerial","Organization name"
   *         in: query
   *         required: false
   *         type: boolean
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const params = helper.get_pagination_params(req.query);

    const isMinimal = req.query?.minimal === "true";
    if (isMinimal) params.attributes = ["id", "name", "cardSerial"];
    else {
      params.include = [
        {
          as: "Organization",
          model: models.Organization,
          attributes: ["name"],
        },
        {
          as: "Role",
          model: models.Role,
        },
      ];
    }

    params.where = {
      orgId: req.params.organizationId,
    };

    const users = await UserModel.findByOrgId(params);

    return apiResponse.pagination(res, req, users.data, users.count);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.getUserIdsAndCountByOrganizationId = (req, res) => {
  /**
   * @swagger
   *
   * /user/count/{organizationId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all users based upon the organization id (Admin Or Super Admin)
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: organizationId
   *         description: organization ID
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.params, {
      organizationId: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const orgId = req.params.organizationId;
      const ids = await UserModel.findUserIdsByOrgId(orgId);
      let userIds = [];

      if (ids.ids) userIds = ids.ids.map((user) => user.id);

      return apiResponse.success(res, req, { userIds, count: ids.count });
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.list_active = async (req, res) => {
  /**
   * @swagger
   *
   * /user/all/active:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all end users
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await UserModel.list_end_users(limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.list_selective = async (req, res) => {
  /**
   * @swagger
   *
   * /user/selective/{ids}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get selective users
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: ids
   *         description: Comma separated user IDs
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;

    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const ids = req.params.ids.split(",");

    const result = await UserModel.list_selective_users(limit, page, ids);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
exports.getAllUsersByCardSerial = async (req, res) => {
  /**
   * @swagger
   *
   * /user/org/all/{cardSerial}/{orgId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all users from organization who have specific card serial
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: cardSerial
   *         description: card serial to search in all organizations
   *         in: path
   *         required: true
   *         type: string
   *       - name: orgId
   *         description: Organization Id in which you need to search user
   *         in: path
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    let organizationId = req.user.orgId;

    if (req.user.admin) {
      organizationId = req.params.orgId;
    }

    const allOrganizationUsers = await UserModel.findAllUsersByCardSerial(
      req.params.cardSerial,
      organizationId,
    );

    if (allOrganizationUsers)
      return apiResponse.success(res, req, allOrganizationUsers);
    else
      return apiResponse.fail(
        res,
        "No user found with mentioned card serial",
        404,
      );
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /user/get/{userId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get user (Only Admin)
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const userId = req.params.userId ? req.params.userId : req.user.id;
    if (!userId) return apiResponse.fail(res, "User not found", 404);

    let result = await UserModel.findById(userId);

    result = result.toJSON();
    delete result.createdAt;
    delete result.email_token;
    delete result.password;
    delete result.password_token;
    delete result.updatedAt;

    if (!helper.isURL(result.profile_image)) {
      result.profile_image = upload_file.getFileURL(result.profile_image);
    }

    const isAllowed = helper.resourceAccessControl(
      req.user,
      userId,
      result.orgId,
      ["getUsers"],
    );

    if (!isAllowed) return apiResponse.fail(res, "", 403);

    const organizationDevices =
      await UserDeviceModel.get_organization_devics_key_metrics(
        result.orgId,
      ).catch(() => {
        result.devices = {
          total: 0,
          owned: 0,
          share_to_me: 0,
          shared_by_me: 0,
        };
        return apiResponse.success(res, req, result);
      });

    result.devices = organizationDevices;
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_user = (req, res) => {
  /**
   * @swagger
   *
   * /user/update/profile:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update user profile
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
   *       - name: phone
   *         description: User's phone number.
   *         in: formData
   *         required: false
   *         type: string
   *       - name: dateOfBirth
   *         description: User's date of birth.
   *         in: formData
   *         required: false
   *         type: string
   *         format: date
   *       - name: handicapIndex
   *         description: User's Handicap Index.
   *         in: formData
   *         required: false
   *         type: string
   *         format: date
   *       - name: gender
   *         description: User's gender.
   *         in: formData
   *         required: false
   *         type: string
   *         enum:
   *          - male
   *          - female
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "gender",
      function (value) {
        return value === "male" || value === "female";
      },
      'The :attribute field must be either "male" or "female".',
    );

    const validation = new Validator(req.body, {
      name: ["regex:/^([a-zA-Z][a-zA-Z0-9.' ]*)([a-zA-Z0-9.])$/"],
      phone: [`regex:${helper.PhoneRegex}`],
      gender: "gender",
      dateOfBirth: "date",
      handicapIndex: "numeric",
      advance_user: "boolean",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      if (req.body?.name) {
        req.body.name = req.body.name.replace(/\s+/g, " ").trim();
      }

      const user_id = req.user.id;

      if (!user_id) return apiResponse.fail(res, "User not found", 404);

      try {
        await UserModel.findById(user_id);

        const {
          name,
          phone,
          advance_user,
          dateOfBirth,
          gender,
          handicapIndex,
        } = req.body;
        await UserModel.update_user(user_id, {
          name,
          phone,
          advance_user,
          dateOfBirth,
          gender,
          handicapIndex,
        });

        return apiResponse.success(res, req, "User Updated Successfully");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.updateUserDetails = (req, res) => {
  /**
   * @swagger
   *
   * /user/update/{userId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update user (Only Admin)
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: name
   *         description: Name of user
   *         in: formData
   *         required: false
   *         type: string
   *       - name: phone
   *         description: User's phone number.
   *         in: formData
   *         required: false
   *         type: string
   *       - name: role
   *         description: Role of User
   *         in: formData
   *         required: false
   *         type: "string"
   *         enum: [ "customer", "ceo", "operator", "super admin", "admin", "device", "unknown_role"]
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: [`regex:${helper.LettersAndSpacesRegex}`],
      role: "string",
      phone: [`regex:${helper.PhoneRegex}`],
    });

    validation.fails(() => apiResponse.fail(res, validation.errors));

    validation.passes(async () => {
      if (req.body?.name) {
        req.body.name = req.body.name.replace(/\s+/g, " ").trim();
      }

      const user_id = req.params.userId ? req.params.userId : req.user.id;
      const nonOrganizationRoles = rolesSchema.roles
        .filter(({ type }) => type == "nonOrg")
        .map(({ title }) => title.replace(/\s+/g, " ").trim().toLowerCase());

      if (!user_id) return apiResponse.fail(res, "User not found", 404);

      let result;
      try {
        result = await UserModel.findById(user_id);
      } catch (err) {
        return apiResponse.fail(res, "User not found", 404);
      }
      const isValidUser =
        req.user.admin || req.user.orgId === result.dataValues.orgId;

      if (!isValidUser) {
        return apiResponse.fail(
          res,
          "You cannot update user of other organization",
          403,
        );
      }

      const updateUser = {};
      const { role, name, phone } = req.body;
      if (name) updateUser.name = name;
      if (phone) updateUser.phone = phone;

      if (!role) return apiResponse.fail(res, "Role is required", 400);

      if (
        nonOrganizationRoles.includes(
          req.body.role.replace(/\s+/g, "").trim().toLowerCase(),
        ) &&
        !helper.hasProvidedRoleRights(["super"]).success
      ) {
        return apiResponse.fail(res, "", 403);
      }

      const getRole = await RoleModel.getRoleByTitle(role);

      if (!getRole) return apiResponse.fail(res, "Role not found", 404);
      updateUser.roleId = getRole.id;

      await UserModel.update_user(user_id, updateUser);

      if (result.dataValues.status == 0) {
        result.dataValues.name = name;
        await email.reSendRegistrationEmail(result);
      }

      return apiResponse.success(res, req, "User Updated Successfully");
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_pn_permission = (req, res) => {
  /**
   * @swagger
   *
   * /user/push-notification-permission:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update user push notification permission
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: pn_status
   *         description: Push notification permission. true to allow and false to disable
   *         in: formData
   *         required: true
   *         type: boolean
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(
      req.body,
      {
        pn_status: "required|boolean",
      },
      {
        boolean: ":attribute must be a boolean",
      },
    );

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors, 400);
    });

    validation.passes(async function () {
      const user_id = req.user.id;

      // ? Need to discuss this, whether this scenerio will ever reach or not
      if (!user_id) return apiResponse.fail(res, "User not found", 404);

      await UserModel.findById(user_id);

      await UserModel.update_user(user_id, { pn_status: req.body.pn_status });

      await PushNotificationsSubscriptionsModel.update(
        { status: req.body.pn_status ? 1 : 0 },
        { user_id: user_id },
      );

      return apiResponse.success(res, req, "User Updated Successfully");
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.upload_profile_image = async (req, res) => {
  /**
   * @swagger
   *
   * /user/upload/profile-image:
   *   post:
   *     security:
   *       - auth: []
   *     description: Upload Profile Image
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: profile_image
   *         description: Upload Profile Image
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const form = new formidable.IncomingForm();

    const files = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve(files);
      });
    });

    const profileImage = files.profile_image;
    const key = await upload_file.uploadProfileImage(profileImage, req.user.id);

    await UserModel.update_user(req.user.id, { profile_image: key });
    return apiResponse.success(res, req, upload_file.getFileURL(key));
  } catch (err) {
    return apiResponse.fail(res, err.message, err.status || 500);
  }
};

exports.disable_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /user/disable/{userId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Delete user (Only Admin)
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const loggedInUser = req.user;
    await UserModel.disable_by_id(req.params.userId, loggedInUser);

    return apiResponse.success(res, req, "User deleted successfully", 200);
  } catch (err) {
    return apiResponse.fail(res, err.message);
  }
};

exports.enable_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /user/enable/{userId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Enable user
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const loggedInUser = req.user;
    await UserModel.enable_by_id(req.params.userId, loggedInUser);

    return apiResponse.success(res, req, "User enabled successfully", 200);
  } catch (err) {
    return apiResponse.fail(res, err.message);
  }
};

exports.change_password = (req, res) => {
  /**
   * @swagger
   *
   * /user/change-password:
   *   post:
   *     security:
   *      - auth: []
   *     description: Change password
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: old_password
   *         description: Old password
   *         in: formData
   *         required: true
   *         type: string
   *       - name: new_password
   *         description: New Password
   *         in: formData
   *         required: true
   *         type: string
   *       - name: new_password_confirmation
   *         description: User's confirm password.
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  const validation = new Validator(req.body, {
    old_password: "required",
    new_password: "required|confirmed",
    new_password_confirmation: "required",
  });

  validation.fails(() => {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async () => {
    try {
      const user = await UserModel.getAllDetailByWhere({ id: req.user.id });

      try {
        await helper.matchPassword(req.body.old_password, user.password);
      } catch (err) {
        return apiResponse.fail(res, "Invalid Old Password", 422);
      }

      const password = await helper.setPassword(req.body.new_password);

      await UserModel.change_password(user.id, password, "id");

      apiResponse.success(res, req, "Password Changed", 200);
    } catch (err) {
      apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.recover_password_request = (req, res) => {
  /**
   * @swagger
   *
   * /user/recover-password-request:
   *   post:
   *     security: []
   *     description: Password Recovery Request
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: User email to recover password
   *         in: formData
   *         required: true
   *         type: string
   *       - name: question_id
   *         description: Question ID
   *         in: formData
   *         required: false
   *         type: string
   *       - name: answer
   *         description: Answer
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      email: "required|email",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const ConfigurationsModel = require("../../services/configurations");
      const configuration = await ConfigurationsModel.get();

      let user;
      try {
        user = await UserModel.findByEmail(req.body.email);
      } catch (error) {
        return apiResponse.fail(res, "Email not found", 422);
      }

      if (user.status == 0)
        return apiResponse.fail(res, "User not Registered", 500);

      if (!configuration.config.security_question) {
        // security question feature not enabled at application level
        return await send_password_reset_email(req, res, user);
      }

      try {
        if (req.body.answer && req.body.question_id) {
          // validate answer and send email
          const result = await UserSQAnswerModel.validate({
            user_id: user.id,
            answer: req.body.answer,
            question_id: req.body.question_id,
          });

          if (result) return await send_password_reset_email(req, res, user);
          else return apiResponse.fail(res, "Invalid security question answer");
        } else {
          // return security questions to ask answer from user
          const ques_ans = await UserSQAnswerModel.findByUserIDWithoutAnswer(
            user.id,
          );

          if (ques_ans && ques_ans.length > 0)
            return apiResponse.success(res, req, ques_ans);
          else return await send_password_reset_email(req, res, user);
        }
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.recover_password = async (req, res) => {
  /**
   * @swagger
   *
   * /user/reset-password:
   *   get:
   *     security: []
   *     description: Password Recovery Request
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token, which is sent in email
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const token_exists = await UserModel.is_token_exists(
      req.query.token,
      "password_token",
    );

    if (token_exists) return apiResponse.success(res, req, "Token verify");
    else return apiResponse.fail(res, "Invalid token", 422);
  } catch (err) {
    return apiResponse.fail(res, "Invalid token", 422);
  }
};

exports.set_new_password = (req, res) => {
  /**
   * @swagger
   *
   * /user/set-password:
   *   post:
   *     security: []
   *     description: Set new password after password recovery request validate
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: password_token
   *         description: Password recovery token, which is sent in email
   *         in: formData
   *         required: true
   *         type: string
   *       - name: new_password
   *         description: New Password
   *         in: formData
   *         required: true
   *         type: string
   *       - name: new_password_confirmation
   *         description: User's confirm password.
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      password_token: "required",
      new_password: "required|confirmed",
      new_password_confirmation: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      let token_valid = false;
      try {
        token_valid = await UserModel.is_token_exists(
          req.body.password_token,
          "password_token",
        );
      } catch (err) {
        return apiResponse.fail(res, "Email not found", 422);
      }

      if (!token_valid) return apiResponse.fail(res, "Invalid token", 422);

      const password = await helper.setPassword(req.body.new_password);

      await UserModel.change_password(
        req.body.password_token,
        password,
        "token",
      );

      return apiResponse.success(res, req, "Password Changed", 200);
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.email_verify = async (req, res) => {
  /**
   * @swagger
   *
   * /user/email-verify:
   *   get:
   *     security: []
   *     description: Verify Email address api
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token, which is sent in email
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const user = await UserModel.find_by_where({
      email_token: req.query.token,
    }).catch(() => {
      return apiResponse.fail(res, "Invalid token", 422);
    });

    if (!user) return apiResponse.fail(res, "Invalid token", 422);

    await UserModel.verify_email_token(req.query.token);

    const tokens = get_user_auth_tokens(req, user);
    const invitations = await UserInvitations.list_by_where({
      email: user.email,
    }).catch(() => {
      // register token verified but user devices request not updated
      return apiResponse.success(res, req, tokens);
    });

    if (!invitations.length) return apiResponse.success(res, req, tokens);

    invitations.forEach(async (invitation) => {
      if (invitation.invite_from == "sharing device") {
        await UserDeviceModel.update_where(
          { user_id: user.id },
          { share_verify_token: invitation.invitation_token },
        );
      }

      if (invitation.invite_from == "transfer device") {
        await DeviceModel.update_where(
          { transfer: user.id },
          { transfer_token: invitation.invitation_token },
        );
      }
    });

    return apiResponse.success(res, req, tokens);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.verify_invite_token = async (req, res) => {
  /**
   * @swagger
   *
   * /user/verify-invite-token:
   *   get:
   *     security: []
   *     description: Verify Invitation Token only
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token, which is sent in email
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let inv_user;
    try {
      inv_user = await UserInvitations.find_by_token(req.query.token);
    } catch (err) {
      return apiResponse.fail(res, "Invalid token", 422);
    }

    if (!inv_user) return apiResponse.fail(res, "Invalid token", 422);

    // ? Need to discuss this, code should work without ⬇️
    // const user = await UserModel.findByEmail(inv_user.email).catch(() => {
    //   return apiResponse.success(res, req, inv_user);
    // });

    const user = await UserModel.findByEmail(inv_user.email);

    if (!user) return apiResponse.success(res, req, inv_user);

    if (user.status == UsersStatus.inactive) {
      UserModel.update_where(
        { status: 1, email_token: null },
        { email: inv_user.email },
      );
    }

    if (inv_user.invite_from == "sharing device") {
      await UserDeviceModel.verify_shared_token_by_invitation(
        req.query.token,
        user.id,
      );
    } else if (inv_user.invite_from == "transfer device") {
      await DeviceModel.verify_transfer_token({
        token: req.query.token,
        inv_user_id: user.id,
        action: true,
      });
    }

    try {
      await UserInvitations.update(inv_user.id, {
        invitation_token: null,
      });
    } catch (err) {
      return apiResponse.fail(res, "Invalid token", 422);
    }

    return apiResponse.success(res, req, "no_form_need");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_ownership_requests = async (req, res) => {
  /**
   * @swagger
   *
   * /user/ownership-requests:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get user ownership requests
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const result = await DeviceModel.get_ownership_requests(req.user.orgId);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_ownership_request = async (req, res) => {
  /**
   * @swagger
   *
   * /user/ownership-request:
   *   post:
   *     security:
   *      - auth: []
   *     description: Get user ownership requests
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: action
   *         description: provide '0' to reject and '1' to accept
   *         in: formData
   *         required: true
   *         type: number
   *       - name: token
   *         description: Transfer token
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  const validation = new Validator(req.body, {
    token: "required",
  });

  if (validation.fails()) return apiResponse.fail(res, validation.errors);

  try {
    const result = await DeviceModel.verify_transfer_token(
      {
        action: req.body.action,
      },
      { transfer_token: req.body.token },
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_share_requests = async (req, res) => {
  /**
   * @swagger
   *
   * /user/share-requests:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get user share requests
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const result = await UserDeviceModel.get_shared_devices_requests(
      req.user.id,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_share_request = async (req, res) => {
  /**
   * @swagger
   *
   * /user/share-request:
   *   post:
   *     security:
   *      - auth: []
   *     description: Get user share requests
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: action
   *         description: provide '0' to reject and '1' to accept
   *         in: formData
   *         required: true
   *         type: number
   *       - name: token
   *         description: Shared token
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const result = await UserDeviceModel.verify_shared_token(
      req.body.token,
      req.body.action,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_user_settings = async (req, res) => {
  /**
   * @swagger
   *
   * /user/get-user-settings:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get user settings
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const user_id = req.user.id;

    const result = await UserSettings.get(user_id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_user_settings = (req, res) => {
  /**
   * @swagger
   *
   * /user/set-user-settings:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set user settings.
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: config
   *         description: Configuration settings in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      config: "required|json",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      req.body.user_id = req.user.id;

      try {
        await UserSettings.get(req.body.user_id);
        const result = await UserSettings.save(req.body).catch((err) => {
          apiResponse.fail(res, err.message, 500);
        });

        return apiResponse.success(res, req, result);
      } catch (error) {
        const result = await UserSettings.save(req.body).catch((err) => {
          apiResponse.fail(res, err.message, 500);
        });

        return apiResponse.success(res, req, result);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.send_phone_verification_code = (req, res) => {
  /**
   * @swagger
   *
   * /user/send-phone-verification-code:
   *   post:
   *     security:
   *      - auth: []
   *     description: Send code to provided phone number.
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: phone
   *         description: User Phone number
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      phone: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const code_length = 6;

      const phone_code = helper.generate_random_string({
        length: code_length,
        type: "numeric",
      });

      const message = `Your ${code_length} digit verification code is ${phone_code}`;

      try {
        await helper.send_sms(req.body.phone, message);
        await UserModel.update_where(
          {
            phone_code: phone_code,
            phone: req.body.phone,
            phone_verified: false,
          },
          { id: req.user.id },
        );

        return apiResponse.success(res, req, "Verification code sent");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.verify_phone_verification_code = (req, res) => {
  /**
   * @swagger
   *
   * /user/verify-phone-verification-code:
   *   post:
   *     security:
   *      - auth: []
   *     description: Verify phone verification code
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: code
   *         description: Verification Code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      code: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const user = await UserModel.find_by_where({
          id: req.user.id,
          phone_code: req.body.code,
        });

        if (!user) return apiResponse.fail(res, "Invalid Code");

        await UserModel.update_where({ phone_verified: true }, { id: user.id });

        return apiResponse.success(res, req, "Phone number verified");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.send_phone_verification_code_for_app = (req, res) => {
  /**
   * @swagger
   *
   * /user/login/otp:
   *   post:
   *     security: []
   *     description: Send code to provided phone number.
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: phone
   *         description: User Phone number
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      phone: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const phoneNumber = req.body.phone;
        const otpLength = config.auth.mobileAuth.otpLength;
        const otpCode = helper.generate_random_string({
          length: otpLength,
          type: "numeric",
        });

        const message = `Your ${otpLength} digit verification code is ${otpCode}`;
        await helper.send_sms(phoneNumber, message);

        await OtpModel.create({
          phone: phoneNumber,
          code: otpCode,
        });

        return apiResponse.success(res, req, "Verification code sent");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.verify_phone_verification_code_for_app = (req, res) => {
  /**
   * @swagger
   *
   * /user/login/otp/verify:
   *   post:
   *     security: []
   *     description: Verify phone verification code
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: phone
   *         description: Phone Number
   *         in: formData
   *         required: true
   *         type: string
   *       - name: code
   *         description: Verification Code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      phone: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const phoneNumber = req.body.phone;
        const receivedOtp = req.body.code;

        const userOTP = await OtpModel.getByPhone({
          phone: phoneNumber,
          code: receivedOtp,
        });

        if (!userOTP) return apiResponse.fail(res, "OTP not valid");

        await OtpModel.verifyCode(userOTP);

        const user = await UserModel.create_user({
          email: `${phoneNumber}@phonenumber.com`,
          role_id: roleWithAuthorities.golfer.id,
          phone: phoneNumber,
        });

        // Generating Token
        const user_obj = JSON.parse(JSON.stringify(user));

        const expire_time =
          req.body.remember && req.body.remember == "true"
            ? config.jwt.expirationLongInSeconds
            : config.jwt.expirationShortInSeconds;
        user_obj.expire_time = parseInt(expire_time);

        const token = helper.createJwtToken({
          user: user_obj,
          expire_time: user_obj.expire_time,
        });

        const refresh_token = helper.createJwtToken({
          user: user_obj,
          expire_time: config.jwt.refreshExpirationInSeconds,
        });

        return apiResponse.success(res, req, {
          accessToken: token,
          refreshToken: refresh_token,
        });
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_last_login_info = async (req, res) => {
  /**
   * @swagger
   *
   * /user/last-login-info:
   *   get:
   *     security:
   *      - auth: []
   *     description: get user last login information
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: query
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let user_id = req.user.id;
    let user = null;
    let fullAccess = false;
    let manageUser = false;

    if (req.query.user_id && req.user.id != req.query.user_id) {
      user_id = req.query.user_id;
      try {
        user = await UserModel.findById(user_id);
      } catch (err) {
        return apiResponse.fail(res, err.message, 404);
      }

      manageUser = helper.hasProvidedRoleRights(req.user.role, [
        "manageUsers",
      ]).success;

      fullAccess = helper.hasProvidedRoleRights(req.user.role, [
        "super",
      ]).success;
    }

    if (
      (user && user.orgId === req.user.orgId && manageUser) ||
      user_id === req.user.id ||
      fullAccess
    ) {
      const info = await UserLoginInfoModel.getLastLogin(user_id);

      return apiResponse.success(res, req, info);
    } else {
      return apiResponse.fail(res, "You can not perform this action", 403);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all_login_info = async (req, res) => {
  /**
   * @swagger
   *
   * /user/all-login-info:
   *   get:
   *     security:
   *      - auth: []
   *     description: get user all login information
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: query
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let user_id = req.user.id;
    let user = null;
    let fullAccess = false;
    let manageUser = false;
    if (req.query.user_id && req.user.id != req.query.user_id) {
      user_id = req.query.user_id;
      try {
        user = await UserModel.findById(user_id);
      } catch (err) {
        return apiResponse.fail(res, err.message, 404);
      }
      manageUser = helper.hasProvidedRoleRights(req.user.role, [
        "manageUsers",
      ]).success;

      fullAccess = helper.hasProvidedRoleRights(req.user.role, [
        "super",
      ]).success;
    }

    if (
      (user && user.orgId === req.user.orgId && manageUser) ||
      user_id === req.user.id ||
      fullAccess
    ) {
      UserLoginInfoModel.list(user_id)
        .then((info) => {
          apiResponse.success(res, req, info);
        })
        .catch((err) => {
          apiResponse.fail(res, err.message);
        });
    } else {
      apiResponse.fail(res, "You can not perform this action", 403);
    }
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.save_login_info = (req, res) => {
  /**
   * @swagger
   *
   * /user/login-info:
   *   post:
   *     security:
   *      - auth: []
   *     description: Save user login information
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: info
   *         description: JSON string with all user information
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      info: "required|json",
    });
    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(function () {
      req.body.user_id = req.user.id;
      UserLoginInfoModel.create(req.body)
        .then((info) => {
          apiResponse.success(res, req, info);
        })
        .catch((err) => {
          apiResponse.fail(res, err.message);
        });
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.verifyAccount = (req, res) => {
  /**
   * @swagger
   *
   * /user/verify-account:
   *   post:
   *     security:
   *     - auth: []
   *     description: Verify User Account
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email to use for login.
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Activates the account
   */
  try {
    const validation = new Validator(req.body, {
      email: "required|email",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const user = await UserModel.update_where(
          { status: 1 },
          { email: req.body.email },
        );

        if (user[0] !== 0)
          return apiResponse.success(res, req, "User Activated Successfully");
        else throw new Error("Email doesnot exist");
      } catch (error) {
        return apiResponse.fail(res, error.message, 400);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};

exports.getAllUnverifiedUsers = async (req, res) => {
  /**
   * @swagger
   *
   * /user/get-all-unverified-accounts:
   *   get:
   *     security:
   *     - auth: []
   *     description: Fetch All Unverified Account
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Fetches all the unverified accounts
   */
  try {
    const user = await UserModel.get_where({ status: 0 });

    return apiResponse.success(res, req, user);
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};

exports.inviteUser = (req, res) => {
  /**
   * @swagger
   *
   * /user/invite-user:
   *   post:
   *     security:
   *     - auth: []
   *     description: Invite a user to make an account
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: person name.
   *         in: formData
   *         required: false
   *         type: string
   *       - name: email
   *         description: email to use for invite.
   *         in: formData
   *         required: true
   *         type: string
   *       - name: role
   *         description: Role of User
   *         in: formData
   *         required: true
   *         type: "string"
   *         enum: [ "customer", "ceo", "operator", "super admin", "admin", "device"]
   *       - name: orgId
   *         description: organization id (1=Jazz, 2=Telenor, 3=Ufone, 4=Zong for now)
   *         in: formData
   *         required: false
   *         type: number
   *       - name: reportTo
   *         description: User id
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: Activates the account
   */
  try {
    const validation = new Validator(req.body, {
      email: "required|email",
      name: [`regex:${helper.LettersAndSpacesRegex}`],
      role: "required|string",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const params = req.body;
        const invitation = await UserModel.createAndInviteUser({ ...params });

        return apiResponse.success(res, req, invitation);
      } catch (error) {
        if (error.message === "Organization not found") {
          return apiResponse.fail(res, error.message);
        } else if (error.message === "test organization") {
          return apiResponse.fail(
            res,
            "Can not add user to test organization",
            403,
          );
        } else if (error.message === "emailExists") {
          return apiResponse.fail(res, "Email already exists", 422);
        } else if (error.message === "Invitation already sent") {
          return apiResponse.fail(res, "Invitation already sent", 422);
        } else if (error.message === "Role not found") {
          return apiResponse.fail(res, "Role not found", 400);
        } else if (
          error.message === "Report to user id is incorrect" ||
          error.message === "User not found"
        ) {
          return apiResponse.fail(res, "Report to user id is incorrect", 400);
        } else if (error.message === "Invalid role of report to user") {
          return apiResponse.fail(res, "Invalid role of report to user", 403);
        } else if (
          error.message === `${req.body.role} can not be in any organization`
        ) {
          return apiResponse.fail(
            res,
            `${req.body.role} can not be in any organization`,
            403,
          );
        } else {
          return apiResponse.fail(res, error.message, 500);
        }
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};

exports.resendInvitation = (req, res) => {
  /**
   * @swagger
   *
   * /user/resend-invitation:
   *   post:
   *     security:
   *     - auth: []
   *     description: resent invitation to a user to make an account
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email to use for invite.
   *         in: formData
   *         required: true
   *         type: string
   *       - name: role
   *         description: role
   *         in: formData
   *         required: false
   *         type: string
   *         enum: [ "customer", "ceo", "operator", "super admin", "admin"]
   *     responses:
   *       200:
   *         description: Activates the account
   */
  try {
    const validation = new Validator(req.body, {
      email: "required|email",
      role: "in:customer,ceo,super admin,operator,admin",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const user = await UserModel.getAllDetailByWhere({
          email: req.body.email,
        });
        if (!user) return apiResponse.fail(res, "User does not exist", 400);

        if (user.email_token === null) {
          return apiResponse.fail(
            res,
            "User already registered on this email",
            400,
          );
        }

        if (!req.user.admin && req.user.orgId !== user.orgId)
          return apiResponse.fail(res, "Operation can not be performed", 400);

        if (req.body.role) {
          try {
            const role = await RoleModel.getRoleByTitle(req.body.role);
            if (!role) return apiResponse.fail(res, "Role not found");
            UserModel.update_where({ roleId: role.id }, { id: user.id });
          } catch (error) {
            return apiResponse.fail(res, error.message, 400);
          }
        }

        const token = helper.generate_verify_token();
        user.email_token = token;

        await UserModel.update_where(
          { email_token: token },
          { id: user.dataValues.id },
        );

        const updatedUser = await UserModel.find_by_where({
          email: req.body.email,
        });

        const mail = await email.reSendRegistrationEmail(updatedUser);
        apiResponse.success(res, req, {
          message: "User re-Invited successfully",
          mail,
        });
      } catch (error) {
        return apiResponse.fail(res, error.message, 400);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};

exports.completeRegistration = async (req, res) => {
  /**
   * @swagger
   *
   * /user/complete-registration:
   *   post:
   *     security: []
   *     description: Complete User Registration
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
   *         description: Email of user invited
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
   *       - name: token
   *         description: email token.
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: [`regex:${helper.LettersAndSpacesRegex}`],
      email: "required|email",
      password: "required|confirmed",
      password_confirmation: "required",
      phone: ["required", `regex:${helper.PhoneRegex}`],
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const password = await helper.setPassword(req.body.password);

        req.body.password = password;
        await UserModel.update_where(req.body, { email: req.body.email });

        const user = await UserModel.find_by_where({
          email_token: req.query.token,
        });

        await UserModel.verify_email_token(req.query.token);

        const tokens = get_user_auth_tokens(req, user);
        return apiResponse.success(res, req, tokens);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.verifyInviteToken = async (req, res) => {
  /**
   * @swagger
   *
   * /user/verify-email-invite-token:
   *   get:
   *     security: []
   *     description: Verify Email Signup Activation Invite Token
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token to activate the account and signup
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const user = await UserModel.find_by_where({
      email_token: req.query.token,
    });

    if (user) return apiResponse.success(res, req, "Successful");
    else return apiResponse.fail(res, "Token Invalid", 422);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.getInvitationEmailToken = async (req, res) => {
  /**
   * @swagger
   *
   * /user/email-token/{email}:
   *   get:
   *     security:
   *     - auth: []
   *     description: Get email token of a user
   *     tags: [User Testing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email address of the user
   *         in: params
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const user = await UserModel.getAllDetailByWhere({
      email: req.params.email,
    });
    const isInvitationPending = user && user.email_token;

    if (!user) {
      return apiResponse.fail(res, "User not found", 422);
    } else if (isInvitationPending) {
      return apiResponse.success(res, req, user.email_token);
    } else {
      return apiResponse.fail(res, "User already accepted the invitation", 422);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /user/delete/{userId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete user
   *     tags: [User]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: user ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.userId;
    const loggedInUser = req.user;

    if (parseInt(id)) {
      const result = await UserModel.delete(id, loggedInUser);
      return apiResponse.success(res, req, result, 200);
    } else return apiResponse.fail(res, "missing/invalid 'userId'", 403);
  } catch (err) {
    return apiResponse.fail(res, err.message);
  }
};

exports.getStatistics = async (req, res) => {
  /**
   * @swagger
   *
   * /user/{userId}/games/statistics:
   *   get:
   *     security:
   *       - auth: []
   *     summary: Statistics
   *     description: logged In user can get Statistics
   *     tags: [User]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: user ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    if (
      !helper.hasProvidedRoleRights(req.user.role, ["super", "admin"])
        .success &&
      req.user.id != req.params.userId
    ) {
      return apiResponse.fail(res, "Forbidden", 403);
    }
    const loggedInUserId = req.params.userId;

    const statistics = await gameService.findStatisticsByParticipantId(
      loggedInUserId,
    );

    const bestRounds = await gameService.findBestRoundsByParticipantId(
      loggedInUserId,
      5,
    );

    const totalStatistics = {
      statistics: statistics,
      bestRounds: bestRounds,
    };

    return apiResponse.success(res, req, totalStatistics);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
