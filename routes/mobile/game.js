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
  router.get(game + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    GameController.getHistory,
  ]);
  router.get(game + "/:gameId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    GameController.getHoles,
  ]);
  router.patch(game + "/holes", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    GameController.updateHoles,
  ]);
  router.patch(game + "/:gameId/end-game", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    GameController.endGame,
  ]);

  router.delete(game + "/users", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    GameController.removePlayerFromAGame,
  ]);
};