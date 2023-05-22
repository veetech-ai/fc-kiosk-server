const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
const ContactCareerController = require("../../controllers/kiosk/contact-careers");
exports.routesConfig = function (app, router) {
  const lesson = `${config.app.apiPath}careers`;
  router.get(lesson + `/:careerId/contacts`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    ContactCareerController.getCareerContacts,
  ]);
  router.patch(lesson + `/contacts/:careerContactId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    ContactCareerController.updateCareerContact,
  ]);
};
