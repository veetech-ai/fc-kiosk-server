const config = require("../config/config");
const FirmwareController = require("../controllers/firmware");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}firmware`;

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.get_all,
  ]);

  router.get(group + "/get/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.get_by_id,
  ]);

  router.get(group + "/get-by-ver/:ver", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.get_by_ver,
  ]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.create,
  ]);

  router.put(group + "/update/:firmwareId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.update,
  ]);

  router.delete(group + "/delete/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.delete,
  ]);

  router.get(group + "/v0-logs/:fv", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.get_firmware_v0_logs,
  ]);

  router.get(group + "/vp-logs/:fv", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.get_firmware_vp_logs,
  ]);

  router.post(group + "/update-count", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    FirmwareController.update_count,
  ]);
};
