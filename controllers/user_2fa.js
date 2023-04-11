// External Module Imports
const Validator = require("validatorjs");
const moment = require("moment");

// Service Imports
const User2FAModel = require("../services/user_2fa");
const UserModel = require("../services/user");

// Common Imports
const helper = require("../common/helper");
const email = require("../common/email");
const apiResponse = require("../common/api.response");

// Configuration Imports
const appSettings = require("../config/settings");

/**
 * @swagger
 * tags:
 *   name: User 2FA
 *   description: User Two Factor Authentication
 */

exports.get = async (req, res) => {
  /**
   * @swagger
   *
   * /user-2fa:
   *   get:
   *     security: []
   *     description: Get user 2FA settings
   *     tags: [User 2FA]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: user_id
   *         description: user ID
   *         in: query
   *         required: true
   *         type: number
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const setting = await User2FAModel.findByID(req.query.user_id);
    if (!setting) return apiResponse.fail(res, "Setting not found");

    return apiResponse.success(res, req, setting);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.save = (req, res) => {
  /**
   * @swagger
   *
   * /user-2fa/save:
   *   post:
   *     security:
   *       - auth: []
   *     description: Save user 2FA settings
   *     tags: [User 2FA]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: status
   *         description: 1=enable, 0=disable
   *         in: formData
   *         required: true
   *         type: boolean
   *       - name: type
   *         description: 1=both(phone, email), 2=phone, 3=email and 4=combine
   *         in: formData
   *         required: false
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    status: "required|boolean",
    type: "required_if:status,true|numeric|in:1,2,3,4",
  });

  validation.fails(function () {
    apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      req.body.status =
        req.body.status == true ||
        req.body.status == "true" ||
        req.body.status == 1 ||
        req.body.status == "1";

      if (req.body.type) {
        req.body.type = parseInt(req.body.type);
      }

      req.body.user_id = req.user.id;

      const setting = await User2FAModel.save(req.body);
      return apiResponse.success(res, req, setting);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.generate_code = async (req, res) => {
  /**
   * @swagger
   *
   * /user-2fa/generate-code:
   *   post:
   *     security: []
   *     description: Generate two factor authentication code for user
   *     tags: [User 2FA]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const user2faEnabled = await helper.user_2fa_enabled(req.body.user_id);
    if (!user2faEnabled)
      return apiResponse.fail(res, "Two factor authentication not enabled");

    // generate code
    const result = await this.generate_2fa_code(req.body.user_id);
    if (result.success) return apiResponse.success(res, req, result.data);

    return apiResponse.fail(res, result.data);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.validate_code = (req, res) => {
  /**
   * @swagger
   *
   * /user-2fa/validate-code:
   *   post:
   *     security: []
   *     description: Validate two factor authentication code sent in email, phone or both
   *     tags: [User 2FA]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: formData
   *         required: true
   *         type: number
   *       - name: code
   *         description: two factor authentication code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  const validation = new Validator(req.body, {
    user_id: "required",
    code: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const user2faEnabled = await helper.user_2fa_enabled(req.body.user_id);
      if (!user2faEnabled)
        return apiResponse.fail(res, "Two factor authentication not enabled");

      await User2FAModel.validate_code({
        user_id: req.body.user_id,
        code: req.body.code,
      });

      const user = await UserModel.findById(req.body.user_id);
      const tokens = helper.get_user_auth_tokens(req, user);

      return apiResponse.success(res, req, tokens);
    } catch (err) {
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.generate_2fa_code = async (user_id) => {
  try {
    const user = await UserModel.find_by_where({ id: user_id });
    if (!user) {
      return {
        success: false,
        data: "Invalid User",
      };
    }

    // generate code
    const token = helper.generate_random_string({
      length: appSettings.get("TFA_code_length"),
    });

    let sendSms = false;
    let sendEmail = false;
    let halfHalf = false;

    const codeExpiry = appSettings.get("TFA_code_expiray");
    const resendTriesLimit = appSettings.get("TFA_resend_tries_limit");
    const resendIntervalLimit = appSettings.get(
      "TFA_resend_tries_limit_time_interval",
    );

    const setting = await User2FAModel.findByID(user_id, [
      "resend_tries",
      "last_send",
    ]);

    switch (setting.type) {
      case User2FAModel.model.PHONE_AND_EMAIL:
        sendSms = true;
        sendEmail = true;
        break;
      case User2FAModel.model.PHONE:
        sendSms = true;
        break;
      case User2FAModel.model.EMAIL:
        sendEmail = true;
        break;
      case User2FAModel.model.COMBINE:
        halfHalf = true;
        break;
      default:
        break;
    }

    let allow = true;
    if (sendSms || halfHalf) {
      if (setting.last_send) {
        const now = moment();
        const last_send = moment(setting.last_send);
        const diff = now.diff(last_send, "minutes");
        if (
          diff < resendIntervalLimit &&
          setting.resend_tries >= resendTriesLimit
        ) {
          allow = false;
        } else if (
          diff >= resendIntervalLimit &&
          setting.resend_tries >= resendTriesLimit
        ) {
          setting.resend_tries = 0;
        }
      } else {
        if (setting.resend_tries >= resendTriesLimit) {
          allow = false;
        }
      }
    } else {
      setting.resend_tries = -1;
    }

    if (!allow) {
      return {
        success: false,
        data: `Your code limits are full. Please try after ${resendIntervalLimit} minutes.`,
      };
    }

    if (user.phone) {
      user.phone = user.phone.trim();
    }

    if (!user.phone && (sendSms || halfHalf)) {
      return {
        success: false,
        data: "Phone number not found",
      };
    }

    const saveParams = {
      code: token,
      user_id: user.id,
      expiry: moment().add(codeExpiry, "minutes"),
      resend_tries: setting.resend_tries + 1,
    };

    if (setting.resend_tries == 0) {
      saveParams.last_send = new Date();
    }

    await User2FAModel.save(saveParams);

    const message = `Your two factor authentication code is "${token}"`;
    let smsg;
    let lmsg = null;

    // setting up sms and email msg
    if (halfHalf) {
      const half_len = appSettings.get("TFA_code_length") / 2;
      smsg = `Your two factor authentication code first part is "${token.substring(
        -1,
        half_len,
      )}"`;
      lmsg = `Your two factor authentication code second part is "${token.substring(
        half_len,
      )}"`;
    }

    // sending email
    if (sendEmail || halfHalf) {
      email.two_factor_authentication({
        to: user.email,
        subject: "Two factor authentication code",
        body: smsg || message,
      });
    }
    // sending sms
    if (sendSms || halfHalf) {
      let fmsg = lmsg || message;
      fmsg += `\n\nCode will be expire in ${codeExpiry} minutes`;
      helper.send_sms(user.phone, fmsg);
    }

    return {
      success: true,
      data: {
        uid: setting.user_id,
        utfaid: setting.id,
        tfauth: true,
      },
    };
  } catch (err) {
    return {
      success: false,
      data: err.message,
    };
  }
};
