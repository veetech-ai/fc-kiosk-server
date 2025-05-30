const config = require("../../config/config");
const CoursesController = require("../../controllers/kiosk/kiosk_courses/courses");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courses = `${config.app.apiPath}kiosk-courses`;
  router.post(courses, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    CoursesController.create_courses,
  ]);
  router.get(courses + "/:orgId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CoursesController.get_courses_for_organization,
  ]);

  router.patch(courses + "/:courseId/course-info", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CoursesController.create_course_info,
  ]);

  router.get(courses + "/:courseId/course-info", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CoursesController.getCourseInfo,
  ]);
  router.get(courses, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    CoursesController.getCourses,
  ]);
};
