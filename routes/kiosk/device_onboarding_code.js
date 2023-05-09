const config = require("../../config/config");
const DeviceOnboardingCodesController = require("../../controllers/kiosk/device_onboarding_code");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const baseUrl = `${config.app.apiPath}device-onboarding-codes`;

  router.get(baseUrl + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    DeviceOnboardingCodesController.getDeviceOnboardingCode,
  ]);

  router.get(baseUrl + "/refresh", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    DeviceOnboardingCodesController.refreshDeviceOnboardingCode,
  ]);
};
