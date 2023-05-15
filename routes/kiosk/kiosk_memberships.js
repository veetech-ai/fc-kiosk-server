const config = require("../../config/config");
const MembershipsController = require("../../controllers/kiosk/kiosk_memberships/memberships");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const memberships = `${config.app.apiPath}kiosk-courses`;
  router.post(memberships + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    MembershipsController.createMembership,
  ]);
  router.get(memberships + "/:orgId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    MembershipsController.getMemberships,
  ]);
  router.get(memberships + "/memberships/:gcId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    MembershipsController.getMemberships,
  ]);
//   router.patch(memberships + "/:courseId/course-info", [
//     validation_middleware.validJWTNeeded,
//     validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
//     MembershipsController.create_course_info,
//   ]);
};
