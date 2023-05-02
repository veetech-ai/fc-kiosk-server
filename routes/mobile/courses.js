const config = require("../../config/config");
const CoursesController = require("../../controllers/mobile/courses");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courses = `${config.app.apiPath}courses`;

  router.get(courses, [
    validation_middleware.validJWTOptional,
    CoursesController.get_courses,
  ]);

  router.get(`${courses}/:courseId`, [
    validation_middleware.validJWTOptional,
    CoursesController.getCourse,
  ]);
};
