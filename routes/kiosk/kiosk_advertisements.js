const config = require("../../config/config");
const AdvertisementsController = require("../../controllers/kiosk/kiosk_advertisements/advertisements");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const advertisements = `${config.app.apiPath}kiosk-advertisements`;
  router.post(advertisements + "/:gcId" , [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    AdvertisementsController.createAdvertisements,
  ]);
  router.get(advertisements + "/:orgId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    AdvertisementsController.get_courses_for_organization,
  ]);
  router.patch(advertisements + "/:courseId/course-info", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    AdvertisementsController.create_course_info,
  ]);
};
