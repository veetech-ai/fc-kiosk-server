const config = require("../config/config");
const ModeController = require("../controllers/mode");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}mode`;

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    ModeController.get_all,
  ]);
  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ModeController.create,
  ]);
  router.put(group + "/update/:modeId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    ModeController.update_mode,
  ]);

  router.get(group + "/get/:id", [
    validation_middleware.validJWTNeeded,
    ModeController.get_by_id,
  ]);
};
