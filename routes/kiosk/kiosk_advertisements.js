const config = require("../../config/config");
const AdvertisementsController = require("../../controllers/kiosk/kiosk_advertisements/advertisements");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const advertisements = `${config.app.apiPath}kiosk-advertisements`;

  router.get(advertisements , [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    AdvertisementsController.getAllAdvertisements,
  ]);

  router.post(advertisements + "/:gcId" , [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    AdvertisementsController.createAdvertisements,
  ]);

};