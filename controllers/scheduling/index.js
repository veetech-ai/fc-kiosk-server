// External Module Imports
const Validator = require("validatorjs");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");

// Service Model Imports
const ScheduleModel = require("../../services/schedule");
const DeviceModel = require("../../services/device");
const OrganizationDeviceModel = require("../../services/user_device");
const OrganizationDeviceSettingsModel = require("../../services/user_device_settings");
const GroupsModel = require("../../services/user_device_groups");

// Logger Imports
const { logger } = require("../../logger");

// Helper Imports
const {
  push_schedule,
  attach_devices_schedule_func,
  attach_groups_schedule_func,
} = require("./helpers");

/**
 * @swagger
 * tags:
 *   name: Scheduling
 *   description: Scheduling management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get schedule
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const limit =
      req.query.limit && req.query.limit <= 100
        ? parseInt(req.query.limit)
        : 10;
    let page = 0;
    if (req.query) {
      if (req.query.page) {
        req.query.page = parseInt(req.query.page);
        page = Number.isInteger(req.query.page) ? req.query.page : 0;
      }
    }

    const result = await ScheduleModel.list(req.user.orgId, limit, page);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/get/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get schedule by ID
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Schedule ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await ScheduleModel.findByID(req.params.id);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = (req, res) => {
  /**
   * @swagger
   *
   * /schedule/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new schedule
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: Name (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: schedule
   *         description: Schedule (JSON string)
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    schedule: "required|json",
    name: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const additionalProperties = {
        orgId: req.body.orgId ?? req.user.orgId,
        admin_created: req.user.admin,
      };
      Object.assign(req.body, additionalProperties);

      const schedule = await ScheduleModel.create(req.body);

      push_schedule(req.body.schedule, schedule.id);

      const invalidDeviceIds = [];
      if (req.body.create_with_device_ids) {
        const devices = req.body.create_with_device_ids.toString().split(",");

        try {
          if (!mqtt_connection_ok) return;

          helper.set_mqtt_connection_lost_log("NAPP scheduling.js.create:");

          for await (const device_id of devices) {
            try {
              const device = await DeviceModel.findById(device_id);
              if (
                !device ||
                (req.body.orgId && device.owner_id !== req.body.orgId)
              ) {
                invalidDeviceIds.push(device.id);
                continue;
              }
              await OrganizationDeviceSettingsModel.set_schedule(device.id, {
                orgId: device.owner_id,
                schedule_id: schedule.id,
              });

              helper.mqtt_publish_message(`d/${device.id}/ac/sch`, {
                token: schedule.id,
              });
            } catch (err) {
              logger.error(err);
            }
          }
        } catch (err) {
          logger.error(err);
        }
      }

      return apiResponse.success(res, req, schedule);
    } catch (err) {
      if (err.message == "nameExists")
        return apiResponse.fail(res, err.message);

      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /schedule/update/{id}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update schedule
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: name
   *         description: Name (Unique)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: Description
   *         in: formData
   *         required: false
   *         type: string
   *       - name: schedule
   *         description: Schedule (JSON string)
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    schedule: "required|json",
    name: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const id = Number(req.params.id);

      if (!id || Number.isNaN(id))
        return apiResponse.fail(res, "Invalid schedule");
      const whereForSchedule = {
        id,
      };

      if (req.body.orgId !== undefined)
        return apiResponse.fail(
          res,
          "Can not update the schedule's organization",
        );

      if (req.user.orgId) whereForSchedule.orgId = req.user.orgId;
      const schedule = await ScheduleModel.find(whereForSchedule);
      if (!schedule) return apiResponse.fail(res, "Schedule not found", 404);

      req.body.orgId = schedule.orgId;
      const result = await ScheduleModel.update(schedule.id, req.body);

      push_schedule(req.body.schedule, schedule.id);

      return apiResponse.success(res, req, result);
    } catch (err) {
      if (err.message == "nameExists")
        return apiResponse.fail(res, err.message);
      return apiResponse.fail(res, err.message, 500);
    }
  });
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/delete/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete schedule
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Schedule ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const id = req.params.id;
    if (!id) return apiResponse.fail(res, "Schedule not found", 404);

    const schedule = await ScheduleModel.findByID(id);
    if (!schedule) return apiResponse.fail(res, "Schedule not found", 404);

    const result = await ScheduleModel.delete(id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_un_attach_groups = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/un-attach-groups:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get Un-attach groups
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    let where = { schedule_id: null };
    const orgId = req.query.orgId ?? req.user.orgId;
    if (orgId) where.orgId = orgId;
    const result = await GroupsModel.get_by_where(where);

    return apiResponse.success(res, req, result);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_un_attach_devices = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/un-attach-devices:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get Unattach devices
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Schedule ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const orgId = req.query.orgId ?? req.user.orgId;
    const result =
      await OrganizationDeviceModel.get_all_un_schedule_organization_devices(
        orgId,
      );

    const devices = [];

    Object.keys(result).forEach(function (key) {
      if (result[key].Device.Group) {
        // do nothing
      } else if (result[key].Device.Settings) {
        if (!result[key].Device.Settings.schedule_id) {
          devices.push(result[key]);
        } else {
          // do nothing
        }
      } else {
        devices.push(result[key]);
      }
    });

    return apiResponse.success(res, req, devices);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_schedule_devices = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/{id}/get/devices:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get schedule Devices
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Schedule ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const scheduleId = Number(req.params.id);
    if (!scheduleId || isNaN(scheduleId))
      return apiResponse.fail(res, "Invalid schedule id", 400);
    const orgId = req.user.orgId;
    const findScheduleWhere = {
      id: scheduleId,
    };
    if (orgId) {
      Object.assign(findScheduleWhere, { orgId: { [Op.or]: [null, orgId] } });
    }
    const schedule = await ScheduleModel.find(findScheduleWhere);
    if (!schedule) return apiResponse.fail(res, "Schedule not found", 404);

    const devices = await OrganizationDeviceSettingsModel.get_schedule_devices(
      scheduleId,
      orgId,
    );

    return apiResponse.success(res, req, devices);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_schedule_groups = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/{id}/get/groups:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get schedule by ID
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Schedule ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const scheduleId = Number(req.params.id);
    if (!scheduleId || isNaN(scheduleId))
      return apiResponse.fail(res, "Invalid schedule id", 400);

    const orgId = req.user.orgId;
    const findScheduleWhere = {
      id: scheduleId,
    };
    if (orgId) {
      Object.assign(findScheduleWhere, { orgId: { [Op.or]: [null, orgId] } });
    }
    const schedule = await ScheduleModel.find(findScheduleWhere);
    if (!schedule) return apiResponse.fail(res, "Schedule not found", 404);
    // Find attached groups
    const findGroupsWhere = {
      schedule_id: scheduleId,
      ...(orgId ? { orgId } : {}),
    };
    const groups = await GroupsModel.get_by_where(findGroupsWhere);

    return apiResponse.success(res, req, groups);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_devices = (req, res) => {
  /**
   * @swagger
   *
   * /schedule/attach/devices:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach device to schedule
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: schedule_id
   *         description: Schedule ID
   *         in: formData
   *         required: false
   *         type: number
   *       - name: device_ids
   *         description: Device IDs (comma seprated string)
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      // schedule_id: 'required',
      device_ids: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const devicesIds = req.body.device_ids.toString().split(",");
        const scheduleId = req.body.schedule_id ?? null;
        const updatedDeviceIds = await attach_devices_schedule_func(
          devicesIds,
          req.user.orgId,
          scheduleId,
        );
        if (updatedDeviceIds?.length > 0) {
          return apiResponse.success(res, req, updatedDeviceIds);
        }
        return apiResponse.fail(res, updatedDeviceIds, 400);
      } catch (err) {
        let statusCode = 500;
        if (err?.message == "Schedule not found") statusCode = 404;
        return apiResponse.fail(res, err.message, statusCode);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_groups = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/attach/groups:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach groups to schedule
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: schedule_id
   *         description: Schedule ID
   *         in: formData
   *         required: false
   *         type: number
   *       - name: groups_ids
   *         description: Groups IDs (comma seprated string)
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    // schedule_id: 'required',
    groups_ids: "required",
  });

  if (validation.fails()) {
    return apiResponse.fail(res, validation.errors);
  }

  try {
    const groups_ids = req.body.groups_ids.toString().split(",");
    const scheduleId = req.body.schedule_id ?? null;

    const updatedGroupsIds = await attach_groups_schedule_func(
      groups_ids,
      req.user.orgId,
      scheduleId,
    );
    if (updatedGroupsIds?.length > 0) {
      return apiResponse.success(res, req, updatedGroupsIds);
    }
    return apiResponse.fail(res, updatedGroupsIds, 400);
  } catch (err) {
    let statusCode = 500;
    if (err?.message == "Schedule not found") statusCode = 404;
    return apiResponse.fail(res, err.message, statusCode);
  }
};

exports.mqtt_syncing = async (req, res) => {
  /**
   * @swagger
   *
   * /schedule/sync/mqtt:
   *   get:
   *     security:
   *       - auth: []
   *     description: Syncing with MQTT
   *     tags: [Scheduling]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: fsshc
   *         description: secret
   *         in: header
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    if (!mqtt_connection_ok)
      return apiResponse.fail(
        res,
        "Sorry!. Request not completed. MQTT issue.",
      );

    const schedules = await ScheduleModel.listAll([
      "id",
      "schedule",
      "mqtt_token",
    ]);

    for (const i in schedules) {
      push_schedule(JSON.stringify(schedules[i].schedule), schedules[i].id);
    }

    return apiResponse.success(res, req, "ok");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
