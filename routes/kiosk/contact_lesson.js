const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
const ContactLessonController = require("../../controllers/kiosk/contact_lesson");
exports.routesConfig = function (app, router) {
  const lesson = `${config.app.apiPath}course-lesson`;
  router.get(lesson + `/:lessonId/contacts`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    ContactLessonController.getLessonContacts,
  ]);
  router.patch(lesson + `/contacts/:contactCoachId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    ContactLessonController.updateContactLesson,
  ]);
};
