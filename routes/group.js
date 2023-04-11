const config = require("../config/config");
const GroupController = require("../controllers/group");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}group`;

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    GroupController.get_all,
  ]);

  router.get(group + "/get/:id", [
    validation_middleware.validJWTNeeded,
    GroupController.get_by_id,
  ]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    GroupController.create,
  ]);

  router.put(group + "/update/:id", [
    validation_middleware.validJWTNeeded,
    GroupController.update,
  ]);

  router.delete(group + "/delete/:id", [
    validation_middleware.validJWTNeeded,
    GroupController.delete,
  ]);

  router.get(group + "/ungrouped-user-devices", [
    validation_middleware.validJWTNeeded,
    GroupController.get_ungrouped_user_devices,
  ]);

  router.post(group + "/attach-devices", [
    validation_middleware.validJWTNeeded,
    GroupController.attach_devices,
  ]);

  router.put(group + "/unlink-device", [
    validation_middleware.validJWTNeeded,
    GroupController.unlink_device,
  ]);

  router.put(group + "/:id/update-name", [
    validation_middleware.validJWTNeeded,
    GroupController.update_group_name,
  ]);

  router.post(group + "/attach-firmware", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    GroupController.attach_firmware,
  ]);

  router.post(group + "/attach-bulk-firmware", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    GroupController.attach_bulk_firmware,
  ]);

  router.get(group + "/history/all", [
    validation_middleware.validJWTNeeded,
    GroupController.get_history_all,
  ]);
  router.get(group + "/history/recent", [
    validation_middleware.validJWTNeeded,
    GroupController.get_recent_history,
  ]);
  router.get(group + "/history", [
    validation_middleware.validJWTNeeded,
    GroupController.get_history,
  ]);
  router.post(group + "/history", [
    // validation_middleware.validJWTNeeded,
    GroupController.set_history,
  ]);
};
