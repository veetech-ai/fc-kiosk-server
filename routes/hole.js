const config = require("../config/config");
const HoleController = require("../controllers/hole/hole");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const holes = `${config.app.apiPath}holes`;
  router.get(holes + "/:gameId", [
    validation_middleware.validJWTNeeded,
    HoleController.getHoles,
  ]);
};
