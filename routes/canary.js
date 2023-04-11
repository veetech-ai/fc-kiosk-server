const config = require("../config/config");
const CanaryController = require("../controllers/canary");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}canary`;

  // for super admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    CanaryController.get_all,
  ]);
};
