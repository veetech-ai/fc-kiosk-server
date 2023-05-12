const config = require("../../config/config");
const KioskContentCouponsController = require("../../controllers/kiosk/kiosk_content/coupons");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const kioskContentBaseUrl = `${config.app.apiPath}kiosk-content`;
  router.post(kioskContentBaseUrl + "/coupons", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["admin", "manageCoupons"]),
    KioskContentCouponsController.create,
  ]);
};
