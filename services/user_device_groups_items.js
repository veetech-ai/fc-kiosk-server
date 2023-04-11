const { logger } = require("../logger");

const models = require("../models");
const DeviceModel = require("../services/device");
const GroupsModel = require("../services/user_device_groups");
const OrganizationDeviceSettingsServices = require("../services/user_device_settings");

const OrganizationDeviceGroupsItems = models.Organization_Device_Groups_Items;

const helper = require("../common/helper");

// not required
exports.list = async (userId) => {
  return await OrganizationDeviceGroupsItems.findAll({
    where: { user_id: userId },
  });
};

// not required
exports.findByID = async (id) => {
  return await OrganizationDeviceGroupsItems.findOne({
    where: { id: id },
  });
};

exports.findByWhere = async (where) => {
  return await OrganizationDeviceGroupsItems.findOne({
    where,
  });
};

exports.device_exists = async (deviceId) => {
  return await OrganizationDeviceGroupsItems.findOne({
    where: { device_id: deviceId },
  });
};

exports.create = async (params) => {
  const result = await this.device_exists(params.device_id);
  if (result) throw new Error("alreadyExists");

  return await OrganizationDeviceGroupsItems.create(params);
};

exports.attach_devices = async (userOrgId, groupId, deviceIds) => {
  const group = await GroupsModel.findByID(groupId, userOrgId);
  if (!group) throw new Error("group not found");

  if (!mqtt_connection_ok) return true;
  const devices = deviceIds.split(",");

  // set callback handlers
  helper.set_mqtt_connection_lost_log(
    "NAPP Organization_Device_Groups_Items.js.attach_devices:",
  );
  let attachedDeviceIds = [];
  for await (const deviceId of devices) {
    try {
      const device = await DeviceModel.findById(deviceId);
      if (!device || !device.bill_cleared) continue;
      if (group.orgId && group.orgId !== device.owner_id) continue;
      if (userOrgId && device.owner_id !== userOrgId) continue; // if orgId is non null

      let createResponse = await this.create({
        organization_device_group_id: groupId,
        orgId: device.owner_id,
        device_id: deviceId,
      });
      attachedDeviceIds.push(createResponse.device_id);

      helper.mqtt_publish_message(`d/${device.id}/ac/group`, {
        group: group.id,
      });

      helper.mqtt_publish_message(`d/${device.id}/ac/sch`, {
        token: null,
      });
      await OrganizationDeviceSettingsServices.set_schedule(device.id, {
        schedule_id: null,
      });
    } catch (error) {
      logger.error(error.message);
    }
  }

  return attachedDeviceIds;
};

// not required
exports.update = async (id, params) => {
  const result = await OrganizationDeviceGroupsItems.update(params, {
    where: { id: id },
  });

  if (!result) throw new Error("There is a problem. Please try later.");
  return result;
};

exports.delete_by_id = async (id) => {
  const result = await OrganizationDeviceGroupsItems.destroy({
    where: { id: id },
  });

  if (!result) throw new Error("There is a problem. Please try later.");
  return result;
};

exports.delete_by_row = async (where) => {
  return await OrganizationDeviceGroupsItems.destroy({ where });
};
