const config = require("../../config/config");
const KioskContentController = require("../../controllers/kiosk/kiosk_content/kiosk_content");
const validation_middleware = require("../../middlewares/auth.validation");
const FeedbackController = require("../../controllers/kiosk/kiosk_content/feedback");
const LessonController= require("../../controllers/kiosk/kiosk_content/lesson");

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

  router.get(kioskContentBaseUrl + "/lessons", [
    validation_middleware.onlyDeviceAccess,
    LessonController.getLessons,
  ]);
};
