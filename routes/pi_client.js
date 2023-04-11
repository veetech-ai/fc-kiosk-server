const config = require("../config/config");
const clinetController = require("../controllers/pi_client");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}client`;
  router.post(group + "/sim-limit", [
    validation_middleware.validJWTNeeded,
    clinetController.get_sim_limit,
  ]);
};
