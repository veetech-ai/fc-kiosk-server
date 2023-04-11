const config = require("../config/config");
const WifiController = require("../controllers/wifi/wifi");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}wifi`;

  router.post(group + "/pin", [
    validation_middleware.validJWTNeeded,
    WifiController.device_pin,
  ]);

  router.get(group + "/list", [
    validation_middleware.validJWTNeeded,
    WifiController.device_list,
  ]);

  router.post(group + "/connect-wifi", [
    validation_middleware.validJWTNeeded,
    WifiController.connect_device,
  ]);

  router.get(group + "/wifi-list", [
    validation_middleware.validJWTNeeded,
    WifiController.wifi_list,
  ]);

  router.post(group + "/wifi-password", [
    validation_middleware.validJWTNeeded,
    WifiController.wifi_password,
  ]);
};
