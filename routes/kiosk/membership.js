const config = require("../../config/config");
const CourseMembershipController = require("../../controllers/kiosk/course_membership");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const membership = `${config.app.apiPath}course-membership`;
  router.patch(membership + `/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseMembershipController.update_membership,
  ]);
  router.get(membership + `/courses/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseMembershipController.get_membership,
  ]);
};
