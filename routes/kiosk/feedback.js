const config = require("../../config/config");
const validation_middleware = require("../../middlewares/auth.validation");
const FeedbacksController=require("../../controllers/kiosk/feedback")

exports.routesConfig = function (app, router) {
  const feedback = `${config.app.apiPath}course-feedbacks`;
  router.get(feedback, + `courses/:courseId` ,[
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    FeedbacksController.getFeedBacksForCourses,
  ]);
};
