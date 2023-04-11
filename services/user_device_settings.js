const { logger } = require("../logger");

const models = require("../models");
const Organization_Device_Settings = models.Organization_Device_settings;

exports.get_device_settings = async (device_id) => {
  return await Organization_Device_Settings.findOne({
    where: { device_id: device_id },
  });
};

exports.get_device_settings_config = async (device_id) => {
  return await Organization_Device_Settings.findOne({
    attributes: ["settings_config"],
    where: { device_id: device_id },
  });
};

exports.set_device_settings_config = async (deviceId, settings_config) => {
  return await Organization_Device_Settings.update(settings_config, {
    where: { device_id: deviceId },
  });
};

exports.get_device_schedule = async (device_id) => {
  return await Organization_Device_Settings.findOne({
    attributes: ["schedule_id"],
    include: [
      {
        as: "Schedule",
        model: models.Schedule,
        attributes: ["id", "name", "description", "schedule", "admin_created"],
      },
    ],
    where: { device_id: device_id },
  });
};

exports.get_by_where = async (where) => {
  return await Organization_Device_Settings.findAll({
    where: where,
  });
};

exports.get_schedule_devices = async (schedule_id, orgId) => {
  const where = {};
  if (orgId) where.orgId = orgId;
  return await Organization_Device_Settings.findAll({
    attributes: ["id", "device_id"],
    where: { schedule_id, ...where },
    include: [
      {
        as: "Device",
        model: models.Device,
        attributes: [
          "id",
          "serial",
          "live_status",
          "bill_cleared",
          "enable_bill",
        ],
        required: true,
        include: [
          {
            as: "Organization_Devices",
            model: models.Organization_Device,
            attributes: ["device_name"],
            where,
          },
        ],
      },
    ],
  });
};

exports.update = async (device_id, params) => {
  return await Organization_Device_Settings.update(params, {
    where: { device_id: device_id },
  });
};

exports.set_schedule = async (device_id, params) => {
  const result = await Organization_Device_Settings.findOne({
    where: { device_id: device_id },
  });

  if (result) {
    return await Organization_Device_Settings.update(params, {
      where: { device_id: device_id },
    });
  } else {
    params.device_id = device_id;
    return await Organization_Device_Settings.create(params);
  }
};

exports.save_settings = async (params, organizationId, device_id) => {
  const result = await Organization_Device_Settings.findOne({
    where: { device_id: device_id },
  });

  if (result) {
    const result = await Organization_Device_Settings.update(
      {
        orgId: organizationId,
        settings: params.settings,
        geofence_id: params.geofence_id,
      },
      { where: { device_id: device_id } },
    );

    if (!result) throw new Error("There is a problem. Please try later.");

    return result;
  } else {
    const result = await Organization_Device_Settings.create({
      settings: params.settings,
      orgId: organizationId,
      device_id: device_id,
      geofence_id: params.geofence_id,
    });

    if (!result) throw new Error("There is a problem. Please try later.");

    return result;
  }
};

exports.updateDeviceConfig = async (config, device_id) => {
  logger.info("updating device config");
  const existingDevice = await Organization_Device_Settings.findOne({
    where: { device_id: device_id },
  });
  if (existingDevice) {
    const updatedDevice = await Organization_Device_Settings.update(config, {
      where: { device_id: device_id },
    });
    if (updatedDevice) return updatedDevice;
    else
      throw new Error("There is a problem while updating. Please try later.");
  } else throw new Error("No device settings found for mentioned device");
};

exports.removeDeviceSettings = async (where) => {
  return await Organization_Device_Settings.destroy({ where });
};
