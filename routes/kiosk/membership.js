const config = require("../../config/config");
const CourseMembershipController = require("../../controllers/kiosk/course_membership");
const CourseMembershipContactController = require("../../controllers/kiosk/contact_membership");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const membership = `${config.app.apiPath}course-membership`;
  router.patch(membership + `/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseMembershipController.update_membership,
  ]);
  router.get(membership + `/:id/contacts`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CourseMembershipContactController.getMembershipContacts,
  ]);
  
  router.patch(membership + `/contacts/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseMembershipContactController.updateContactMembership,
  ])

  router.get(membership + `/courses/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CourseMembershipController.get_membership,
  ]);
};
