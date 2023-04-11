const struct = require("python-struct");

const helper = require("../../common/helper");

const DeviceModel = require("../../services/device");

exports._generateUpdate = async ({ action, deviceId }) => {
  const device = await DeviceModel.findById(deviceId);
  if (!device) return;

  const orgId = device.owner_id;

  action.deviceId = deviceId;
  action.deviceType = device.device_type;

  helper.mqtt_publish_message(`u/${orgId}/station`, { action }, false);
};

exports.transformUserLoginData = (byteArray) => {
  const decodingPattern = "QHb";
  const unpackedData = struct.unpack(
    decodingPattern,
    Buffer.from(byteArray),
    false,
  );

  const formattedData = {
    tsm: Number(unpackedData[0]),
    userId: String(unpackedData[1]),
    status: unpackedData[2],
  };

  return formattedData;
};
