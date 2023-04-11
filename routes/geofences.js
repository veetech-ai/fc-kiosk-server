const config = require("../config/config");
const GeoFenceController = require("../controllers/geofences");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}geofence`;

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    GeoFenceController.get_all,
  ]);

  router.get(group + "/get/:id", [
    validation_middleware.validJWTNeeded,
    GeoFenceController.get_by_id,
  ]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    GeoFenceController.create,
  ]);

  router.put(group + "/update/:id", [
    validation_middleware.validJWTNeeded,
    GeoFenceController.update,
  ]);

  router.delete(group + "/delete/:id", [
    validation_middleware.validJWTNeeded,
    GeoFenceController.delete,
  ]);
};
