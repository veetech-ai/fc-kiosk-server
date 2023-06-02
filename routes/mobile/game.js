const config = require("../../config/config");
const GameController = require("../../controllers/mobile/game");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const game = `${config.app.apiPath}game`;
  router.post(game + "/", [
    validation_middleware.validJWTNeeded,
    GameController.create_game,
  ]);
  router.get(game + "/:gameId/holes", [
    validation_middleware.validJWTNeeded,
    GameController.getHoles,
  ]);
};
