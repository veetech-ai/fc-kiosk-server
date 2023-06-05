const config = require("../../config/config");
const ClubsController = require("../../controllers/mobile/clubs");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const clubs = `${config.app.apiPath}clubs`;

  router.get(clubs, [
    validation_middleware.validJWTNeeded,
    ClubsController.get_clubs,
  ]);
};
