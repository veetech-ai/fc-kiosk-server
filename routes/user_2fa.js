const config = require("../config/config");
const User2FAController = require("../controllers/user_2fa");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}user-2fa`;

  router.get(group, [
    // validation_middleware.validJWTNeeded,
    User2FAController.get,
  ]);

  router.post(group + "/save", [
    validation_middleware.validJWTNeeded,
    User2FAController.save,
  ]);

  router.post(group + "/generate-code", [
    // validation_middleware.validJWTNeeded,
    User2FAController.generate_code,
  ]);

  router.post(group + "/validate-code", [
    // validation_middleware.validJWTNeeded,
    User2FAController.validate_code,
  ]);
};
