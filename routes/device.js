const config = require("../config/config");
const DeviceController = require("../controllers/device/device");
const validation_middleware = require("../middlewares/auth.validation");

exports.routesConfig = function (app, router) {
  const group = `${config.app.apiPath}device`;

  // for admin
  router.get(group + "/all", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    DeviceController.get_all,
  ]);
  router.post(group + "/create", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    DeviceController.create,
  ]);
  router.post(group + "/create/onboarding", [
    validation_middleware.isValidDeviceCode,
    DeviceController.create,
  ]);
  router.put(group + "/update/:deviceId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    DeviceController.update_device,
  ]);
  router.put(group + "/:id/name", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    DeviceController.updateDeviceName,
  ]);
  // for user
  router.get(group + "/my", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_devices,
  ]);
  router.get(group + "/:id", [
    validation_middleware.validJWTNeeded,
    DeviceController.getById,
  ]);
  router.get(group + "/get/:serial/:isId?", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_by_serial,
  ]);
  router.post(group + "/attach-user", [
    validation_middleware.validJWTNeeded,
    DeviceController.attach_user,
  ]);
  router.put(group + "/:id/name", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    DeviceController.updateDeviceName,
  ]);
  // for user
  router.get(group + "/my", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_devices,
  ]);
  router.get(group + "/:id", [
    validation_middleware.validJWTNeeded,
    DeviceController.getById,
  ]);
  router.get(group + "/get/:serial/:isId?", [
    validation_middleware.validJWTNeeded,
    DeviceController.un_attach_user,
  ]);

  router.put(group + "/set-device-name", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    DeviceController.set_device_name,
  ]);

  router.get(group + "/schedule/:serial", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_schedule,
  ]);
  router.post(group + "/set-device-schedule", [
    validation_middleware.validJWTNeeded,
    DeviceController.set_device_schedule,
  ]);

  router.get(group + "/settings/:id", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_setting,
  ]);

  router.get(group + "/settings/config/:deviceId", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_setting_config,
  ]);

  router.post(group + "/settings/config", [
    validation_middleware.validJWTNeeded,
    validation_middleware.superAdminWithOrganizationIdOrCustomerAccess,
    DeviceController.set_device_setting_config,
  ]);

  router.post(group + "/set-device-setting", [
    validation_middleware.validJWTNeeded,
    validation_middleware.superAdminWithOrganizationIdOrCustomerAccess,
    DeviceController.set_device_setting,
  ]);
  router.post(group + "/set-device-setting/offset", [
    validation_middleware.validJWTNeeded,
    validation_middleware.superAdminWithOrganizationIdOrCustomerAccess,
    DeviceController.set_device_offset_setting,
  ]);

  router.post(group + "/share", [
    validation_middleware.blockApis,
    validation_middleware.validJWTNeeded,
    DeviceController.share,
  ]);

  router.get(group + "/share-verification/:token", [
    validation_middleware.blockApis,
    DeviceController.share_verification,
  ]);

  router.get(group + "/share-with/:serial", [
    validation_middleware.blockApis,
    validation_middleware.validJWTNeeded,
    DeviceController.share_with,
  ]);

  router.put(group + "/revoke-share-access", [
    validation_middleware.blockApis,
    validation_middleware.validJWTNeeded,
    DeviceController.revoke_share_access,
  ]);

  router.post(group + "/transfer", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.transfer,
  ]);
  router.get(group + "/transfer-verification/:token", [
    DeviceController.transfer_verification,
  ]);

  router.post(group + "/reset", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin"]),
    DeviceController.reset,
  ]);

  router.get(group + "/history/all", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_history_all,
  ]);
  router.get(group + "/history/recent", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_recent_history,
  ]);
  router.get(group + "/history/location", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_location_history,
  ]);
  router.get(group + "/history", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_history,
  ]);
  router.post(group + "/history", [
    // validation_middleware.validJWTNeeded,
    DeviceController.set_device_history,
  ]);

  router.get(group + "/ping", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_ping,
  ]);

  router.get(group + "/historyping", [
    validation_middleware.validJWTNeeded,
    DeviceController.historyping,
  ]);

  router.get(group + "/wifi/preferred-channel", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_wifi_preferred_channel,
  ]);
  router.post(group + "/wifi/preferred-channel", [
    validation_middleware.validJWTNeeded,
    DeviceController.set_device_wifi_preferred_channel,
  ]);

  router.get(group + "/diagnostics", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_diagnostics,
  ]);
  router.post(group + "/diagnostics", [
    validation_middleware.validJWTNeeded,
    DeviceController.set_device_diagnostics,
  ]);
  router.put(group + "/diagnostics/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    DeviceController.update_device_diagnostics,
  ]);

  router.post(group + "/device-to-slack", [DeviceController.device_to_slack]);
  router.post(group + "/attach-firmware", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.attach_firmware,
  ]);
  router.post(group + "/attach-bulk-firmware", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.attach_bulk_firmware,
  ]);

  router.get(group + "/v0-logs/:serial", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.get_device_v0_logs,
  ]);

  router.get(group + "/vp-logs/:serial", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.get_device_vp_logs,
  ]);

  router.post(group + "/print-label", [
    validation_middleware.validJWTNeeded,
    // validation_middleware.hasAccess([ 'super' ]),
    DeviceController.print_label,
  ]);

  router.post(group + "/printlabel", [
    validation_middleware.validJWTNeeded,
    // validation_middleware.hasAccess([ 'super' ]),
    DeviceController.print_label,
  ]);

  router.put(group + "/slack-notifications/:deviceId", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.update_slack_notifications,
  ]);

  router.get(group + "/:deviceId/children", [
    validation_middleware.validJWTNeeded,
    DeviceController.get_device_children,
  ]);

  router.post(group + "/:deviceId/attach-child/:childDeviceId", [
    validation_middleware.validJWTNeeded,
    DeviceController.attach_device_child,
  ]);

  router.put(group + "/:deviceId/detach-child/:childDeviceId", [
    validation_middleware.validJWTNeeded,
    DeviceController.detach_device_child,
  ]);
  router.put(group + "/:deviceId/courses/:courseId/link", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices"]),
    DeviceController.link_device_to_course,
  ]);
  router.get(group + "/type/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super", "admin", "manageDevices", "ceo"]),
    DeviceController.getByType,
  ]);

  router.get(group + "/config/:id", [
    validation_middleware.validJWTNeeded,
    DeviceController.getDeviceConfig,
  ]);
  router.put(group + "/config/:id", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.setDeviceConfig,
  ]);
  router.get(group + "/:id/disable-kiosk-mode", [
    validation_middleware.validJWTNeeded,
    validation_middleware.hasAccess(["super"]),
    DeviceController.disableKioskMode,
  ]);
};
