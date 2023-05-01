const config = require("../../config/config");
const CoursesController = require("../../controllers/kiosk_courses/courses");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courses = `${config.app.apiPath}kiosk-courses`;
  router.get(courses + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    CoursesController.create_courses,
  ]);
};
