const config = require("../../config/config");
const adsController = require("../../controllers/mobile/ads");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const ads = `${config.app.apiPath}ads`;

  router.post(ads, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    adsController.createAd,
  ]);
  router.get(ads, [validation_middleware.validJWTNeeded, adsController.getAds]);
  router.patch(ads + "/:adId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    adsController.updateAd,
  ]);
  router.delete(ads + "/:adId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    adsController.deleteAd,
  ]);
};
