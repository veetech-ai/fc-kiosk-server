const config = require("../../config/config");
const CourseShopsController = require("../../controllers/kiosk/course_shops");
const validation_middleware = require("../../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const courseShops = `${config.app.apiPath}course-shops`;

  router.post(courseShops, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseShopsController.createCourseShop,
  ]);

  router.get(courseShops + "/course/:courseId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "getCourses"]),
    CourseShopsController.getCourseShops,
  ]);

  router.patch(courseShops + "/:shopId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseShopsController.updateCourseShop,
  ]);

  router.delete(courseShops + "/:shopId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    CourseShopsController.deleteCourseShop,
  ]);
};
