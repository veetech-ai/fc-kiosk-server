const config = require("../config/config");
const CoursesController = require("../controllers/courses/courses");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courses = `${config.app.apiPath}courses`;

  router.get(courses, [
    validation_middleware.validJWTNeeded,
    CoursesController.get_courses,
  ]);
  router.get(courses + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    
  ]);
};
