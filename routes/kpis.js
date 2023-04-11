const config = require("../config/config");
const KpisController = require("../controllers/kpis");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}kpis`;

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    KpisController.get_all,
  ]);

  router.get(group + "/feedback", [
    validation_middleware.validJWTNeeded,
    KpisController.get_feedback_data,
  ]);
  router.get(group + "/avg-screen-time", [
    validation_middleware.validJWTNeeded,
    KpisController.get_avg_screen_time,
  ]);
  router.get(group + "/avg-type-time", [
    validation_middleware.validJWTNeeded,
    KpisController.get_type_time,
  ]);
};
