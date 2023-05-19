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
    CareersController.patch,
  ]);
};
