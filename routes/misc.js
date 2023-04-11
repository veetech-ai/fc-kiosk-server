const config = require("../config/config");
const MiscController = require("../controllers/misc");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}misc`;

  router.post(group + "/contact/", [
    // validation_middleware.validReCaptchaToken,
    MiscController.contact_us,
  ]);

  router.get(group + "/app-configuration", [MiscController.get_app_config]);

  router.post(group + "/app-configuration", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    MiscController.set_app_config,
  ]);

  router.get(group + "/assets", [
    // validation_middleware.validJWTNeeded,
    // validation_middleware.hasAccess([ 'super' ]),
    MiscController.get_assets,
  ]);
  router.post(group + "/assets", [
    // validation_middleware.validJWTNeeded,
    // validation_middleware.hasAccess([ 'super' ]),
    MiscController.post_assets,
  ]);

  router.get(group + "/sync-user-device-payments", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    MiscController.sync_user_device_payments,
  ]);

  router.get(group + "/build-cache-update", [
    validation_middleware.custom_token,
    MiscController.build_cache_update,
  ]);

  router.get(group + "/get-build-version", [MiscController.getBuildVersion]);

  router.get(group + "/get-sms-logs", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    MiscController.get_sms_logs,
  ]);

  router.get(group + "/pi-client-build-update", [
    validation_middleware.custom_token,
    MiscController.pi_client_build_update,
  ]);

  router.get(group + "/pi-backend-build-update", [
    validation_middleware.custom_token,
    MiscController.pi_backend_build_update,
  ]);
};
