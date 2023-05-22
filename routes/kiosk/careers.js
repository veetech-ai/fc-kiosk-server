const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");
const CareersController = require("../../controllers/kiosk/career");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}careers`;
  router.post(group + "/", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CareersController.create,
  ]);

  router.patch(group + "/:careerId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CareersController.updateCareerById,
  ]);

  router.get(group + "/courses/:courseId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CareersController.getCareersByCourseId,
  ]);
  router.delete(group + "/:careerId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CareersController.deleteCareerById,
  ]);
  router.get(group + "/:careerId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CareersController.getCareerById,
  ]);
};
