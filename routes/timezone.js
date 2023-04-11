const config = require("../config/config");
const TimezoneController = require("../controllers/timezone");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}timezone`;

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    TimezoneController.get_all,
  ]);
  router.get(group + "/time", [TimezoneController.time]);
};
