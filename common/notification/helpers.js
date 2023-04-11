// Service Imports
const DeviceModel = require("../../services/device");
const UserDeviceModel = require("../../services/user_device");

exports.replaceDeviceNamePlaceholder = async (notice, userId, deviceId) => {
  if (notice.indexOf("{device_name}") < 0) {
    return notice;
  }

  if (!userId || !deviceId) {
    return this.replacePlaceholder({ str: notice });
  }

  // need to fetch device name and add it in notification message
  try {
    const userDevice = await UserDeviceModel.get_user_device(userId, deviceId);
    const deviceName = userDevice.device_name || userDevice.Device.serial;

    if (!deviceName)
      return this.replacePlaceholder({ str: notice, replace: deviceName });

    // can change device serial also. (user_device.Device.serial)
    const device = await DeviceModel.findById_with_select(deviceId, ["serial"]);

    return this.replacePlaceholder({
      str: notice,
      replace: device.serial || null,
    });
  } catch (err) {
    const device = await DeviceModel.findById_with_select(deviceId, ["serial"]);
    return this.replacePlaceholder({
      str: notice,
      replace: device.serial || null,
    });
  }
};

exports.replacePlaceholder = (params) => {
  return params.str.replace(/{device_name}/g, params.replace || "device");
};
