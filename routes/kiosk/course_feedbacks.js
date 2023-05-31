const CourseFeedBacksController = require("../../controllers/kiosk/course_feedbacks");
const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
exports.routesConfig = function (app, router) {
  const feedback = `${config.app.apiPath}course-feedback`;
  router.get(feedback + `/courses/:courseId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CourseFeedBacksController.getCourseFeedBacks,
  ]);
  router.patch(feedback + "/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseFeedBacksController.updateFeedBack,
  ]);
};
