const config = require("../../config/config");
const CourseFaqsController = require("../../controllers/kiosk/course-faqs");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courseFaqs = `${config.app.apiPath}course-faqs`;

  router.post(courseFaqs, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseFaqsController.createCourseFaq,
  ]);

  router.get(courseFaqs + "/courses/:courseId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CourseFaqsController.getCourseFaqs,
  ]);

  router.patch(courseFaqs + "/:faqId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseFaqsController.updateCourseFaq,
  ]);

  router.delete(courseFaqs + "/:faqId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseFaqsController.deleteCourseFaq,
  ]);
};
