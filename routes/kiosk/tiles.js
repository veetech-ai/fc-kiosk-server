const validation_middleware = require("../../middlewares/auth.validation");
const config = require("../../config/config");

const TilesController = require("../../controllers/kiosk/tiles");

exports.routesConfig = function (app, router) {
  const tiles = `${config.app.apiPath}tiles`;
  router.post(tiles, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    TilesController.create,
  ]);

  router.patch(tiles + "/:id/order", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    TilesController.changeOrder,
  ]);

  router.patch(tiles + "/:id/super", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    TilesController.updateSuperTile,
  ]);

  router.patch(tiles + "/:id/publish", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    TilesController.udpatePublishedStatus,
  ]);

  router.patch(tiles + "/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    TilesController.updateTile,
  ]);

  router.get(tiles + "/course/:id", [
    validation_middleware.validJWTNeeded,
    TilesController.getCourseTiles,
  ]);

  router.get(tiles, [
    validation_middleware.validJWTNeeded,
    TilesController.getAll,
  ]);

  router.get(tiles + `/:id`, [
    validation_middleware.validJWTNeeded,
    TilesController.getOne,
  ]);
  router.delete(tiles + `/:id/course/:gcId`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageCourses"]),
    TilesController.deleteCourseTile,
  ]);

  router.delete(tiles + `/:id`, [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    TilesController.deleteTile,
  ]);
};
