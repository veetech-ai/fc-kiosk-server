const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
const AdsController = require("../../controllers/kiosk/ads");
exports.routesConfig = function (app, router) {
  const ads = `${config.app.apiPath}ads`;
  router.post(ads, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    AdsController.createAd,
  ]);
  router.get(ads + `/courses/:courseId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    AdsController.getAds,
  ]);
};
