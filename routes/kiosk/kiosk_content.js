const config = require("../../config/config");
const KioskContentController = require("../../controllers/kiosk_content/kiosk_content");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const kioskContentBaseUrl = `${config.app.apiPath}kiosk-content`;
  router.get(kioskContentBaseUrl + "/screens", [
    validation_middleware.onlyDeviceAccess,
    KioskContentController.get_screens_for_device,
  ]);
  //   router.get(courses + "/:orgId", [
  //     validation_middleware.validJWTNeeded,
  //     validation_middleware.hasAccess(["super", "admin", "getCourses"]),
  //     CoursesController.get_courses_for_organization,
  //   ]);
};
