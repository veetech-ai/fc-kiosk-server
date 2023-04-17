const config = require("../config/config");
const AuthorizationController = require("../controllers/authorization/authorization");
const validation_middleware = require("../middlewares/auth.validation");
exports.routesConfig = function (app, router) {
  router.post(`${config.app.apiPath}auth`, [AuthorizationController.login]);

  router.post(`${config.app.apiPath}facebook/auth`, [
    AuthorizationController.fb_login,
  ]);

  router.post(`${config.app.apiPath}google/auth`, [
    AuthorizationController.google_login,
  ]);

  router.post(`${config.app.apiPath}twitter/auth`, [
    AuthorizationController.twitter_login,
  ]);

  router.post(`${config.app.apiPath}refresh-token`, [
    AuthorizationController.refresh_token,
  ]);

  router.post(`${config.app.apiPath}auth/login-as`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    AuthorizationController.login_as,
  ]);

  router.get(`${config.app.apiPath}auth/checkToken`, [
    validation_middleware.validJWTNeeded,
    AuthorizationController.checkToken,
  ]);

  // router.get(`${config.app.apiPath}twitter/call`, [
  //   AuthorizationController.twitter,
  // ]);

  // router.get(`${config.app.apiPath}twitter/callback`, [
  //   AuthorizationController.twitter_callback,
  // ]);

  router.get(`${config.app.apiPath}get-social-email/:socialType/:socialId`, [
    AuthorizationController.get_social_email,
  ]);

  router.post(`${config.app.apiPath}auth/verify-code`, [
    AuthorizationController.verify_code,
  ]);

  router.post(`${config.app.apiPath}auth/resend-activation-email`, [
    AuthorizationController.resend_activation_email,
  ]);
};
