const config = require("../../config/config");
const KioskContentController = require("../../controllers/kiosk/kiosk_content/kiosk_content");
const KioskContentCouponController = require("../../controllers/kiosk/kiosk_content/coupons");

const validation_middleware = require("../../middlewares/auth.validation");
const FeedbackController = require("../../controllers/kiosk/kiosk_content/feedback");
const ShopsController = require("../../controllers/kiosk/kiosk_content/shops");

exports.routesConfig = function (app, router) {
  const kioskContentBaseUrl = `${config.app.apiPath}kiosk-content`;
  router.get(kioskContentBaseUrl + "/screens", [
    validation_middleware.onlyDeviceAccess,
    KioskContentController.get_screens_for_device,
  ]);

  router.get(kioskContentBaseUrl + "/course-info", [
    validation_middleware.onlyDeviceAccess,
    KioskContentController.getCourseInfo,
  ]);

  router.post(kioskContentBaseUrl + "/feedback", [
    validation_middleware.onlyDeviceAccess,
    FeedbackController.create_feedback,
  ]);

  router.get(kioskContentBaseUrl + "/shops", [
    validation_middleware.onlyDeviceAccess,
    ShopsController.getShops,
  ]);

  router.patch(kioskContentBaseUrl + "/coupons", [
    validation_middleware.onlyDeviceAccess,
    KioskContentCouponController.redeemCoupon,
  ]);
};
