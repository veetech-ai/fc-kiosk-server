const config = require("../../config/config");
const UserGameInvitationsController = require("../../controllers/mobile/user-game-invitations");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const game = `${config.app.apiPath}user-game-invitations`;
  router.post(game + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    UserGameInvitationsController.createUserGameInvitations,
  ]);
  router.get(game + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["manageGames"]),
    UserGameInvitationsController.getUserGameInvitations,
  ]);
};
