const config = require("../config/config");
const MqttController = require("../controllers/mqtt/mqtt");
// const validation_middleware = require('../middlewares/auth.validation')

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}mqtt`;

  // for admin
  router.get(group + "/logs/all", [
    // validation_middleware.validJWTNeeded,
    MqttController.get_all,
  ]);
  router.post(group + "/logs/create", [MqttController.create]);
};
