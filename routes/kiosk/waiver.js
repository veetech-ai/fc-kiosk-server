const WaiverController = require("../../controllers/kiosk/waiver");
const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");

exports.routesConfig = function (app, router) {
  const waiver = `${config.app.apiPath}waiver`;

  router.post(waiver + "/sign", [WaiverController.sign]);

  router.patch(waiver + "/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    WaiverController.update,
  ]);

  router.delete(waiver + "/signed/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    WaiverController.deleteSignedWaiver,
  ]);

  router.get(waiver + "/course/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    WaiverController.getCourseSignedWaivers,
  ]);
};
