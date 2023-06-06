const config = require("../../config/config");
const adsScreenController = require("../../controllers/mobile/ads-screens");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const adsScreen = `${config.app.apiPath}adsScreens`;

  router.get(adsScreen, [
    validation_middleware.validJWTOptional,
    adsScreenController.getScreens,
  ]);
};
