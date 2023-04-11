const config = require("../config/config");
const SchedulingController = require("../controllers/scheduling");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}schedule`;

  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess([
      "super",
      "admin",
      "getSchedules",
      "manageSchedules",
    ]),
    SchedulingController.get_all,
  ]);

  router.get(group + "/get/:id", [
    validation_middleware.validJWTNeeded,
    SchedulingController.get_by_id,
  ]);

  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageSchedules"]),
    SchedulingController.create,
  ]);

  router.put(group + "/update/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageSchedules"]),
    SchedulingController.update,
  ]);

  router.delete(group + "/delete/:id", [
    validation_middleware.validJWTNeeded,
    SchedulingController.delete,
  ]);

  router.get(group + "/un-attach-groups", [
    validation_middleware.validJWTNeeded,
    SchedulingController.get_un_attach_groups,
  ]);

  router.get(group + "/un-attach-devices", [
    validation_middleware.validJWTNeeded,
    SchedulingController.get_un_attach_devices,
  ]);

  router.get(group + "/:id/get/devices", [
    validation_middleware.validJWTNeeded,
    SchedulingController.get_schedule_devices,
  ]);

  router.get(group + "/:id/get/groups", [
    validation_middleware.validJWTNeeded,
    SchedulingController.get_schedule_groups,
  ]);

  router.post(group + "/attach/devices", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageSchedules"]),
    SchedulingController.attach_devices,
  ]);

  router.post(group + "/attach/groups", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageGroups"]),
    SchedulingController.attach_groups,
  ]);

  router.get(group + "/sync/mqtt", [
    validation_middleware.custom_token,
    SchedulingController.mqtt_syncing,
  ]);
};
