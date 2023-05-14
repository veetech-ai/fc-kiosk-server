const CourseLessonsController = require("../../controllers/kiosk/lessons");
const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
exports.routesConfig = function (app, router) {
  const lesson = `${config.app.apiPath}course-lesson`;
  router.post(lesson, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseLessonsController.create_lesson,
  ]);
  router.patch(lesson + "/:lessonId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseLessonsController.update_lesson,
  ]);
};
