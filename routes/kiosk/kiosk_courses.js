const config = require("../../config/config");
const CoursesController = require("../../controllers/kiosk/kiosk_courses/courses");
const CourseLessonsController = require("../../controllers/kiosk/kiosk_courses/lessons");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courses = `${config.app.apiPath}kiosk-courses`;
  router.post(courses + "/create", [
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
  router.post(courses + "/:orgId/:courseId/lesson", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    CourseLessonsController.create_lesson,
  ]);
  router.patch(courses + "/lesson/:lessonId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseLessonsController.update_lesson,
  ]);
};
