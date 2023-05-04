const config = require("../../config/config");
const ScreenConfigController = require("../../controllers/screenConfig/screens");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const screenConfig = `${config.app.apiPath}screenconfig/courses`;

  router.get(screenConfig + "/:courseId", [
    validation_middleware.validJWTOptional,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    ScreenConfigController.get_screens_for_course,
  ]);
  router.put(screenConfig + "/:courseId", [
    validation_middleware.validJWTOptional,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    ScreenConfigController.update_screen_for_course,
  ]);
};
