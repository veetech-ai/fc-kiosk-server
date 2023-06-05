const config = require("../../config/config");
const GameController = require("../../controllers/mobile/game");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const game = `${config.app.apiPath}games`;
  router.post(game + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    GameController.create_game,
  ]);
  router.get(game + "/:gameId", [
    validation_middleware.validJWTNeeded,
    GameController.getHoles,
  ]);
};
