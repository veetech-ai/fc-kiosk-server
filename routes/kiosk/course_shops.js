const config = require("../../config/config");
const CourseShopsController = require("../../controllers/kiosk/course_shops");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courses = `${config.app.apiPath}course-shops`;
  
  router.post(courses, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseShopsController.createCourseShop,
  ]);
  
  router.get(courses + "/course/:gcId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CourseShopsController.getCourseShops,
  ]);
  
  // router.patch(courses + "/:courseId/course-info", [
  //   validation_middleware.validJWTNeeded,
  //   validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
  //   CourseShopsController.createCourseShop,
  // ]);
};
