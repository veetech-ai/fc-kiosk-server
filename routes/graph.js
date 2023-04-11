const config = require("../config/config");
const GraphController = require("../controllers/graph/graph");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}graph`;

  router.get(group + "/get", [
    validation_middleware.validJWTNeeded,
    GraphController.get,
  ]);
  router.get(group + "/power-cable-tester", [
    validation_middleware.validJWTNeeded,
    GraphController.getPowerCableTesterData,
  ]);
  router.get(group + "/battery-log", [
    validation_middleware.validJWTNeeded,
    GraphController.battery_logs,
  ]);

  router.get(group + "/device/:deviceId/logs", [
    validation_middleware.validJWTNeeded,
    GraphController.device_logs,
  ]);
};
