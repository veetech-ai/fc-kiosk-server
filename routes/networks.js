const config = require("../config/config");
const NetworksController = require("../controllers/networks");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}network`;

  router.get(group + "/user", [
    validation_middleware.validJWTNeeded,
    NetworksController.get_user_networks,
  ]);

  router.get(group + "/device/:deviceId", [
    validation_middleware.validJWTNeeded,
    NetworksController.get_device_networks,
  ]);

  router.post(group + "/create/user", [
    validation_middleware.validJWTNeeded,
    NetworksController.create_user_network,
  ]);

  router.post(group + "/create/device", [
    validation_middleware.validJWTNeeded,
    NetworksController.create_device_network,
  ]);

  router.delete(group + "/delete/user", [
    validation_middleware.validJWTNeeded,
    NetworksController.delete_user_network,
  ]);

  router.delete(group + "/delete/device", [
    validation_middleware.validJWTNeeded,
    NetworksController.delete_device_network,
  ]);
};
