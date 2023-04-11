const config = require("../config/config");
const RolesController = require("../controllers/roles");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}roles`;

  router.get(group + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getRoles"]),
    RolesController.getAll,
  ]);
};
