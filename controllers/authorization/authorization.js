// External Imports
const Validator = require("validatorjs");
// const LoginWithTwitter = require("login-with-twitter");

// Logger Imports
const { logger } = require("../../logger");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const email = require("../../common/email");

// Service Imports
const UserModel = require("../../services/user");

// Configuration Imports
const config = require("../../config/config");

// Helpers Import
const {
  login_action,
  social_user_reg_action,
  get_app_title_slug,
} = require("./helpers");

// const tw = new LoginWithTwitter({
//   consumerKey: config.twitter.key,
//   consumerSecret: config.twitter.secret,
//   callbackUrl: `${config.twitter.callbackURL}`,
// });

const UsersStatus = UserModel.UsersStatus;
/**
 * @swagger
 * tags:
 *   name: Account
 *   description: Authentication and Authorization
 */

exports.login = (req, res) => {
  /**
   * @swagger
   *
   * /auth:
   *   post:
   *     security: []
   *     description: Login to the application
   *     tags: [Account]
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
   *       - name: password
   *         description: User's password.
   *         in: formData
   *         required: true
   *         type: string
   *       - name: remember
   *         description: Remember Login
   *         in: formData
   *         required: false
   *         default: false
   *         type: boolean
   *     responses:
   *       200:
   *         description: login
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      email: "required|email",
      password: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // Verify Email address
        if (
          req.body.remember &&
          (req.body.remember === "true" ||
            req.body.remember === "True" ||
            req.body.remember === true)
        ) {
          req.body.remember = true;
        } else req.body.remember = false;

        const user = await UserModel.getAllDetailByWhere({
          email: req.body.email,
        });
        return await login_action(req, res, user);
      } catch (err) {
        if (err.message === "invalidEmail")
          return apiResponse.fail(res, "Invalid email", 422);
        else return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.fb_login = (req, res) => {
  /**
   * /facebook/auth:
   *   post:
   *     security: []
   *     description: Facebook Login to the application
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email to use for login.
   *         in: formData
   *         required: false
   *         type: string
   *       - name: fb_id
   *         description: Facebook User ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: name
   *         description: Facebook name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: phone
   *         description: Phone number
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Facebook Login
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      email: "email",
      fb_id: "required",
      name: "required",
    });
    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // Verify Email address
        req.body.email =
          req.body.email ||
          `${req.body.fb_id}@${get_app_title_slug()}-facebook.com`;

        const user = await UserModel.findByEmail(req.body.email);

        return await login_action(req, res, user, false, "fb");
      } catch (err) {
        if (err == "invalidEmail") {
          // New User Registeration Case
          await social_user_reg_action(req, res, "fb");
        } else {
          apiResponse.fail(res, err.message, 500);
        }
      }
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.google_login = (req, res) => {
  /**
   * /google/auth:
   *   post:
   *     security: []
   *     description: Google Login to the application
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email to use for login.
   *         in: formData
   *         required: false
   *         type: string
   *       - name: g_id
   *         description: Google User ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: name
   *         description: Google user name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: phone
   *         description: Phone number
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Facebook Login
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      email: "email",
      g_id: "required",
      name: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // Verify Email address
        req.body.email =
          req.body.email ||
          `${req.body.g_id}@${get_app_title_slug()}-google.com`;

        const user = await UserModel.findByEmail(req.body.email);

        return await login_action(req, res, user, false, "g");
      } catch (err) {
        if (err == "invalidEmail") {
          // New User Registration Case
          await social_user_reg_action(req, res, "g");
        } else {
          apiResponse.fail(res, err.message, 500);
        }
      }
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.twitter_login = (req, res) => {
  /**
   * /twitter/auth:
   *   post:
   *     security: []
   *     description: Twitter Login to the application
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: email to use for login.
   *         in: formData
   *         required: false
   *         type: string
   *       - name: g_id
   *         description: Twitter User ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: name
   *         description: Twitter user name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: phone
   *         description: Phone number
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Twitter Login
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      email: "email",
      tw_id: "required",
      name: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // Verify Email address
        req.body.email =
          req.body.email ||
          `${req.body.g_id}@${get_app_title_slug()}-twitter.com`;

        const user = await UserModel.findByEmail(req.body.email);
        return await login_action(req, res, user, false, "tw");
      } catch (err) {
        if (err == "invalidEmail") {
          // New User Registeration Case
          await social_user_reg_action(req, res, "tw");
        } else {
          apiResponse.fail(res, err.message, 500);
        }
      }
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.refresh_token = (req, res) => {
  /**
   * @swagger
   *
   * /refresh-token:
   *   post:
   *     security: []
   *     description: Refreash token
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Login token.
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Refreash token
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      token: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(function () {
      const data = helper.refreshJwtToken(req.body.token);
      if (data) apiResponse.success(res, req, data);
      else apiResponse.fail(res, "Refresh token invalid or may expire.", 407);
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.login_as = (req, res) => {
  /**
   * @swagger
   *
   * /auth/login-as:
   *   post:
   *     security: []
   *     description: Login to the application
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: User token to login
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: login
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      token: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // Verify Email address
        const user = await UserModel.find_by_where({
          mqtt_token: req.body.token,
        });

        // Generating Token
        const user_obj = JSON.parse(JSON.stringify(user));
        const expire_time =
          req.body.remember && req.body.remember == "true"
            ? config.jwt.expirationLongInSeconds
            : config.jwt.expirationShortInSeconds;
        user_obj.expire_time = parseInt(expire_time);
        user_obj.admin = !!helper.hasProvidedRoleRights(user.Role, ["admin"])
          .success;
        user_obj.super_admin = !!helper.hasProvidedRoleRights(user.Role, [
          "super",
        ]).success;
        user_obj.lb_sa = req.user;

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

// exports.twitter = (req, res) => {
//   /**
//    * /twitter/call:
//    *   get:
//    *     security: []
//    *     description: Twitter Login to the application
//    *     tags: [Account]
//    *     consumes:
//    *       - application/x-www-form-urlencoded
//    *     produces:
//    *       - application/json
//    *     responses:
//    *       200:
//    *         description: Facebook Login
//    */
//   try {
//     // Verify Email address
//     tw.login((err, tokenSecret, url) => {
//       if (err) apiResponse.fail(res, { err: err.message }, 500);
//       else {
//         // Save the OAuth token secret for use in your /twitter/callback route
//         req.session.tokenSecret = tokenSecret;
//         // apiResponse.success(res, req, {url: url});
//         res.redirect(`${url}`);
//       }
//     });
//   } catch (err) {
//     apiResponse.fail(res, err.message, 500);
//   }
// };

// exports.twitter_callback = (req, res) => {
//   /**
//    * /twitter/callback:
//    *   get:
//    *     security: []
//    *     description: Twitter Login Callback
//    *     tags: [Account]
//    *     consumes:
//    *       - application/x-www-form-urlencoded
//    *     produces:
//    *       - application/json
//    *     responses:
//    *       200:
//    *         description: Facebook Login
//    */

//   try {
//     tw.callback(
//       {
//         oauth_token: req.query.oauth_token,
//         oauth_verifier: req.query.oauth_verifier,
//       },
//       req.session.tokenSecret,
//       async (err, twt_user) => {
//         if (err) {
//           logger.error(err);
//           res.redirect(`${config.app.frontendURL}login?twitter_login=failed`);
//         } else {
//           // Delete the tokenSecret securely
//           delete req.session.tokenSecret;
//           res.redirect(
//             `${config.app.frontendURL}login?twitter_login=success&id=${twt_user.userId}&name=${twt_user.userName}`,
//           );
//         }
//       },
//     );
//   } catch (err) {
//     logger.error(err.message);
//     res.redirect(`${config.app.frontendURL}login?twitter_login=failed`);
//   }
// };

exports.get_social_email = async (req, res) => {
  /**
   * /get-social-email/{socialType}/{socialId}:
   *   get:
   *     security: []
   *     description: Get Social Email of user
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: socialType
   *         description: Social Type
   *         in: path
   *         required: true
   *         type: string
   *       - name: socialId
   *         description: Social ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: User Email
   */
  try {
    if (["fb_id", "g_id", "tw_id"].indexOf(req.params.socialType) <= -1) {
      return apiResponse.fail(res, "Invlid Social type");
    }

    let where = { [req.params.socialType]: req.params.socialId };
    if (req.query.email) {
      where = {
        [UserModel.Op.or]: [
          { [req.params.socialType]: req.params.socialId },
          { email: req.query.email },
        ],
      };
    }

    const result = await UserModel.find_by_where(where);

    if (result) {
      apiResponse.success(res, req, {
        email: result.email,
        phone: result.phone,
      });
    } else return apiResponse.fail(res, "not found");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.verify_code = (req, res) => {
  /**
   * @swagger
   *
   * /auth/verify-code:
   *   post:
   *     security: []
   *     description: Registration verification through activation code
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: Email address
   *         in: formData
   *         required: true
   *         type: string
   *       - name: code
   *         description: Activation Code
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: User Email
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      code: "required",
      email: "required|email",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const user = await UserModel.find_by_where({
          email_code: req.body.code,
          email: req.body.email,
        });

        if (!user) return apiResponse.fail(res, "invalid_code");

        await UserModel.update_where(
          { status: 1, email_token: null, email_code: null },
          { email_code: req.body.code, email: req.body.email },
        );

        const tokens = helper.get_user_auth_tokens(req, user);
        return apiResponse.success(res, req, tokens);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.resend_activation_email = (req, res) => {
  /**
   * @swagger
   *
   * /auth/resend-activation-email:
   *   post:
   *     security: []
   *     description: Resend Activation Email
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: email
   *         description: Email address
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Resend Activation Email
   */
  try {
    // Validation
    const validation = new Validator(req.body, {
      email: "required|email",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const user = await UserModel.find_by_where({
          email: req.body.email,
        });
        if (!user) return apiResponse.fail(res, "invalid_email");

        if (user.status == UsersStatus.active)
          return apiResponse.fail(res, "already_verified");
        else if (user.status == UsersStatus.deleted)
          return apiResponse.fail(res, "deleted");
        else if (user.status == UsersStatus.inactive) {
          const token = helper.generate_verify_token();
          const email_code = helper.generate_random_string({
            length: 10,
          });

          await UserModel.update_where(
            { email_token: token, email_code: email_code },
            { id: user.id },
          );

          await email.send_registration_email(user, token, email_code);

          return apiResponse.success(res, req, "ok");
        }
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.checkToken = async (req, res) => {
  /**
   * @swagger
   *
   * /auth/checkToken:
   *   get:
   *     security: []
   *     description: Check Token Expiry
   *     tags: [Account]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Check Token Expiry
   */
  try {
    // Validation
    const validation = new Validator(req.headers, {
      authorization: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(function () {
      return apiResponse.success(res, req, "Token Verification Successful");
    });
  } catch (error) {
    return apiResponse.fail(res, error.message, 500);
  }
};
