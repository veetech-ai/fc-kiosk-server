const config = require("../config/config");
const GolfController = require("../controllers/golfbert/golfbert");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const golfbert = `${config.app.apiPath}golfbert`;

  router.get(golfbert + "/courses", [
    validation_middleware.validJWTNeeded,
    GolfController.get_courses,
  ]);

  router.get(golfbert + "/courses/:courseId", [
    validation_middleware.validJWTNeeded,
    GolfController.get_courses_by_courseId,
  ]);

  router.get(golfbert + "/courses/:courseId/holes", [
    validation_middleware.validJWTNeeded,
    GolfController.get_holes_by_courseId,
  ]);

  router.get(golfbert + "/courses/:courseId/scorecard", [
    validation_middleware.validJWTNeeded,
    GolfController.get_scorecard_by_courseId,
  ]);

  router.get(golfbert + "/courses/:courseId/teeboxes", [
    validation_middleware.validJWTNeeded,
    GolfController.get_teeboxes_by_courseId,
  ]);

  router.get(golfbert + "/holes", [
    validation_middleware.validJWTNeeded,
    GolfController.get_holes,
  ]);

  router.get(golfbert + "/holes/:holeId", [
    validation_middleware.validJWTNeeded,
    GolfController.get_holes_by_holeId,
  ]);

  router.get(golfbert + "/holes/:holeId/polygons", [
    validation_middleware.validJWTNeeded,
    GolfController.get_polygons_by_holeId,
  ]);

  router.get(golfbert + "/holes/:holeId/teeboxes", [
    validation_middleware.validJWTNeeded,
    GolfController.get_teeboxes_by_holeId,
  ]);

  router.get(golfbert + "/teeboxcolors", [
    validation_middleware.validJWTNeeded,
    GolfController.get_teeboxcolors,
  ]);

  router.get(golfbert + "/teeboxtypes", [
    validation_middleware.validJWTNeeded,
    GolfController.get_teeboxtypes,
  ]);
};
