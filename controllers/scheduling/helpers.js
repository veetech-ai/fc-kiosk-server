// Common Imports
const helper = require("../../common/helper");

// Logger Imports
const { logger } = require("../../logger");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;
// Service Imports
const GroupsModel = require("../../services/user_device_groups");
const DeviceModel = require("../../services/device");
const OrganizationDeviceSettingsModel = require("../../services/user_device_settings");
const ScheduleModel = require("../../services/schedule");

const get_day_number_from_day = (day) => {
  const dayNumbers = { sun: 0, mon: 1, tue: 2, wed: 3, thr: 4, fri: 5, sat: 6 };

  return dayNumbers[day];
};
exports.get_day_number_from_day = get_day_number_from_day;

exports.push_schedule = (schedule, id) => {
  let channel_name = "";
  if (!mqtt_connection_ok) {
    helper.set_mqtt_connection_lost_log("NAPP scheduling.js.push_schedule():");
    return;
  }

  try {
    const sch = JSON.parse(schedule);

    Object.keys(sch).forEach(function (day) {
      for (let j = 0; j < sch[day].length; j++) {
        delete sch[day][j].timestamp;
      }

      channel_name = `sch/${id}/ac/sch/${get_day_number_from_day(day)}`;

      helper.mqtt_publish_message(channel_name, sch[day]);
    });
  } catch (err) {
    logger.error(err);
  }
};

exports.attach_devices_schedule_func = async (
  deviceIds,
  owner_id,
  schedule_id,
) => {
  if (!mqtt_connection_ok) {
    helper.set_mqtt_connection_lost_log(
      "NAPP scheduling.js.attach_devices_schedule_func():",
    );
    throw new Error("Connection with broker is down");
  }
  let schedule;
  if (schedule_id) {
    const where = { id: schedule_id };
    if (owner_id) where.orgId = { [Op.or]: [null, owner_id] };
    // Wait wait!!! Let's check if you actually belong to the schedule's organization or not.

    schedule = await ScheduleModel.find(where);
    if (!schedule) throw new Error("Schedule not found");
  }

  // if schedule id is null then it means that you are trying to detach the schedule from the devices
  const updatedDeviceIds = [];
  for await (const id of deviceIds) {
    try {
      const deviceFindByWhere = { id };
      if (owner_id) deviceFindByWhere.owner_id = owner_id; // organizational user can only schedule there own organization's devices
      const device = await DeviceModel.find(deviceFindByWhere);
      const isDeviceExist = device;
      const isBillCleared = device?.bill_cleared;
      const differentOwners =
        schedule_id &&
        schedule &&
        schedule.orgId &&
        schedule.orgId != device?.owner_id;
      if (!isDeviceExist || !isBillCleared || differentOwners || device.Group)
        continue;

      await OrganizationDeviceSettingsModel.set_schedule(id, {
        orgId: device.owner_id,
        schedule_id: schedule_id,
      });

      helper.mqtt_publish_message(`d/${device.id}/ac/sch`, {
        token: schedule_id,
      });
      updatedDeviceIds.push(device.id);
    } catch (err) {
      logger.error(err);
    }
  }
  return updatedDeviceIds;
};

exports.attach_groups_schedule_func = async (groupIds, orgId, schedule_id) => {
  if (!mqtt_connection_ok) {
    helper.set_mqtt_connection_lost_log(
      "NAPP scheduling.js.attach_groups_schedule_func():",
    );
    throw new Error("Connection with broker is down");
  }
  let schedule;
  if (schedule_id) {
    const where = { id: schedule_id };
    if (orgId) where.orgId = { [Op.or]: [null, orgId] };
    // Wait wait!!! Let's check if you actually belong to the schedule's organization or not.

    schedule = await ScheduleModel.find(where);
    if (!schedule) throw new Error("Schedule not found");
  }

  const updatedGroupIds = [];
  for await (const id of groupIds) {
    try {
      const groupFindWhere = { id };
      if (orgId) groupFindWhere.orgId = orgId; // organizational user can only schedule there own organization's groups

      const group = await GroupsModel.find(groupFindWhere);

      if (
        !group ||
        (schedule_id &&
          schedule &&
          schedule.orgId &&
          schedule.orgId != group.orgId) ||
        group.schedule_id == schedule_id
      )
        continue;

      const updatedRows = await GroupsModel.update(id, {
        schedule_id: schedule_id,
      });
      if (!updatedRows[0]) continue;
      helper.mqtt_publish_message(`g/${id}/ac/sch`, {
        token: schedule_id,
      });
      updatedGroupIds.push(group.id);
    } catch (error) {
      logger.error(error);
    }
  }
  return updatedGroupIds;
};
