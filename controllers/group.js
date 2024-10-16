// External Module Imports
const Validator = require("validatorjs");

// Services Imports
const DeviceModel = require("../services/device");
const GroupsModel = require("../services/user_device_groups");
const ScheduleModel = require("../services/schedule");
const GroupItemsModel = require("../services/user_device_groups_items");
const FirmwareModel = require("../services/firmware");
const GroupHistoryModel = require("../services/group_history");
const organizationService = require("../services/organization");
// Common Imports
const apiResponse = require("../common/api.response");
const { getFileURL } = require("../common/upload");
const helper = require("../common/helper");

// Logger Imports
const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: Device Group management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /group/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get group
   *     tags: [Group]
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
    let result = [];
    if (req.query.sa || !req.user.orgId)
      result = await GroupsModel.super_list(limit, page);
    else result = await GroupsModel.list(req.user.orgId, limit, page);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_id = async (req, res) => {
  /**
   * @swagger
   *
   * /group/get/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get group by ID
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Group ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await GroupsModel.findByID(req.params.id, req.user.orgId);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_ungrouped_user_devices = async (req, res) => {
  /**
   * @swagger
   *
   * /group/ungrouped-user-devices:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get group
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: orgId
   *         description: Organization ID
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    if (!req.user.orgId && req.query.orgId) {
      const organization = await organizationService.findById(req.query.orgId);
      if (!organization)
        return apiResponse.fail(res, "Organization not found", 404);
    }

    const orgId = req.user.orgId ?? req.query.orgId;

    const devices = await DeviceModel.get_ungrouped_devices(orgId);

    return apiResponse.success(res, req, devices);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /group/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new group
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: name
   *         description: Name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_ids
   *         description: Comma separated device ids
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
      // device_ids: 'required',
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    if (!mqtt_connection_ok) {
      helper.set_mqtt_connection_lost_log("NAPP group.js.create:");
      throw new Error("Connection with broker is down");
    }

    // if super admin then orgId in body is required.
    if (!req.user.orgId && !req.body.orgId)
      return apiResponse.fail(res, "Organization id is required", 400);
    else if (!req.user.orgId && req.body.orgId) {
      const organization = await organizationService.findById(req.body.orgId);
      if (!organization)
        return apiResponse.fail(res, "Organization not found", 404);
    }

    req.body.orgId = req.user.orgId ?? req.body.orgId;
    const group = await GroupsModel.create(req.body);

    helper.mqtt_publish_message(
      `g/${group.id}/ac/set`,
      helper.default_remote_settings(),
    );

    if (req.body.schedule_id) {
      const schedule = await ScheduleModel.findByID(req.body.schedule_id);
      if (schedule) {
        helper.mqtt_publish_message(`g/${group.id}/ac/sch`, {
          token: schedule.id,
        });
      }
    }

    if (req.body.device_ids && req.body.device_ids.length > 0) {
      await GroupItemsModel.attach_devices(
        group.orgId,
        group.id,
        req.body.device_ids,
      );
      const modifiedGroup = await GroupsModel.findByID(group.id);

      return apiResponse.success(res, req, modifiedGroup);
    } else {
      return apiResponse.success(res, req, group);
    }
  } catch (err) {
    logger.error("main err");
    logger.error(err);
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update = (req, res) => {
  /**
   * @swagger
   *
   * /group/update/{id}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update group
   *     tags: [Group]
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
   *         description: Name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_ids
   *         description: comma separated device ids
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
      // device_ids: 'required',
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      if (!mqtt_connection_ok) {
        helper.set_mqtt_connection_lost_log("NAPP group.js.update:");
        throw new Error("Connection with broker is down");
      }

      const id = req.params.id;

      if (!id) {
        return apiResponse.fail(res, "group not found", 404);
      }

      const group = await GroupsModel.findByID(id, req.user.orgId);

      if (!group) {
        return apiResponse.fail(res, "group not found", 404);
      }

      const result = await GroupsModel.update(group.id, req.body);

      if (!req.body.schedule_id) {
        helper.mqtt_publish_message(`g/${group.id}/ac/sch`, {
          token: null,
        });
      } else if (req.body.schedule_id != group.schedule_id) {
        const schedule = await ScheduleModel.findByID(req.body.schedule_id);
        if (schedule) {
          helper.mqtt_publish_message(`g/${group.id}/ac/sch`, {
            token: schedule.id,
          });
        }
      }

      return apiResponse.success(res, req, result);
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.delete = async (req, res) => {
  /**
   * @swagger
   *
   * /group/delete/{id}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete group
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Group ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    if (!mqtt_connection_ok) {
      helper.set_mqtt_connection_lost_log("NAPP group.js.delete:");
      throw new Error("Connection with broker is down");
    }
    const id = req.params.id;

    if (!id) {
      return apiResponse.fail(res, "group not found", 404);
    }

    const group = await GroupsModel.findByID(id, req.user.orgId);
    if (!group) {
      return apiResponse.fail(res, "group not found", 404);
    }

    const devices = group.Organization_Device_Groups_Items;

    if (devices.length <= 0) {
      const result = await GroupsModel.delete(id);

      return apiResponse.success(res, req, result);
    }

    await GroupItemsModel.delete_by_row({ organization_device_group_id: id });

    const result = await GroupsModel.delete(id);

    for (let i = 0; i < devices.length; i++) {
      helper.mqtt_publish_message(`d/${devices[i].Device.id}/ac/group`, {
        group: null,
      });
    }

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_devices = (req, res) => {
  /**
   * @swagger
   *
   * /group/attach-devices:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach devices to group
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group_id
   *         description: Group ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_ids
   *         description: Devices ID
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      group_id: "required",
      device_ids: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        if (!mqtt_connection_ok) {
          helper.set_mqtt_connection_lost_log("NAPP group.js.delete:");
          throw new Error("Connection with broker is down");
        }

        const groupId = req.body.group_id;
        const deviceIds = req.body.device_ids;
        const orgId = req.user.orgId;

        if (deviceIds && deviceIds.length > 0) {
          const attachedDevicesResponse = await GroupItemsModel.attach_devices(
            orgId,
            groupId,
            deviceIds,
          );
          await GroupsModel.updateGroupStateOnDeviceLinkOrUnlink(groupId);
          return apiResponse.success(res, req, attachedDevicesResponse);
        } else {
          return apiResponse.fail(res, "Please select devices to attach.");
        }
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.unlink_device = (req, res) => {
  /**
   * @swagger
   *
   * /group/unlink-device:
   *   put:
   *     security:
   *       - auth: []
   *     description: Unlink Device from Group
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group_id
   *         description: Group ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_id
   *         description: Device ID
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    logger.info(
      "🚀 ~ file: group.test.js:599 ~ it.only ~ mqtt_connection_ok:",
      mqtt_connection_ok,
    );

    const validation = new Validator(req.body, {
      group_id: "required",
      device_id: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const orgId = req.user.orgId;
      const { device_id, group_id } = req.body;

      try {
        if (!mqtt_connection_ok) {
          helper.set_mqtt_connection_lost_log("NAPP group.js.unlink_device:");
          throw new Error("Connection with broker is down");
        }

        const device = await DeviceModel.findById(device_id, orgId);
        if (!device) return apiResponse.fail(res, "Device not found");

        const group = await GroupsModel.findByID(group_id, orgId);
        if (!group) return apiResponse.fail(res, "Group not found", 404);

        const isDeviceUnAttached = await GroupItemsModel.delete_by_row({
          organization_device_group_id: group_id,
          orgId: device.owner_id,
          device_id: device_id,
        });

        if (!isDeviceUnAttached) {
          return apiResponse.fail(
            res,
            `Device does not belong to the group`,
            403,
          );
        }

        helper.mqtt_publish_message(`d/${device.id}/ac/group`, {
          group: null,
        });
        await GroupsModel.updateGroupStateOnDeviceLinkOrUnlink(group_id);
        return apiResponse.success(res, req, "deleted");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_group_name = (req, res) => {
  /**
   * @swagger
   *
   * /group/{id}/update-name:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update group name
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Group ID
   *         in: path
   *         required: true
   *         type: string
   *
   *       - name: name
   *         description: Group name
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const id = req.params.id;

      if (!id) {
        return apiResponse.fail(res, "Group not found", 404);
      }

      try {
        const group = await GroupsModel.findByID(id, req.user.orgId);
        if (!group) return apiResponse.fail(res, "Group not found", 404);

        const result = await GroupsModel.update(id, req.body);
        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_firmware = (req, res) => {
  /**
   * @swagger
   *
   * /group/attach-firmware:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach firmware to group
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Firmware Version ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: group_id
   *         description: Group ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: rb
   *         description: Rollback (true -> if upgrading and false if downgrading)
   *         in: formData
   *         required: false
   *         type: boolean
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      id: "required",
      group_id: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        if (!mqtt_connection_ok) {
          helper.set_mqtt_connection_lost_log("NAPP group.js.attach_firmware:");
          throw new Error("Connection with broker is down");
        }

        const group = await GroupsModel.get_by_where_single({
          id: req.body.group_id,
        });

        if (!group) return apiResponse.fail(res, "Invalid Group ID");

        const firmware = await FirmwareModel.findByID(req.body.id, true);
        if (!firmware)
          return apiResponse.fail(res, "Invalid Firmware version provided");

        const result = await GroupsModel.update(group.id, { fv: firmware.ver });

        helper.mqtt_publish_message(`g/${group.id}/s_ota`, {
          version: firmware.ver,
          url: getFileURL(firmware.file),
          hwv: firmware.hw_ver,
          rb: req.body.rb ? req.body.rb : false,
        });

        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_bulk_firmware = (req, res) => {
  /**
   * @swagger
   *
   * /group/attach-bulk-firmware:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach firmware to bulk groups
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Firmware Version ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: groups
   *         description: Groups JSON string with rb
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      id: "required",
      groups: "required|json",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        if (!mqtt_connection_ok) {
          helper.set_mqtt_connection_lost_log(
            "NAPP group.js.attach_bulk_firmware:",
          );
          throw new Error("Connection with broker is down");
        }

        const firmware = await FirmwareModel.findByID(req.body.id, true);
        if (!firmware)
          return apiResponse.fail(res, "Invalid Firmware version provided");

        const groups = JSON.parse(req.body.groups);

        groups.forEach(async (group) => {
          try {
            await GroupsModel.update(group.group_id, { fv: firmware.ver });

            helper.mqtt_publish_message(`g/${group.group_id}/s_ota`, {
              version: firmware.ver,
              url: getFileURL(firmware.file),
              hwv: firmware.hw_ver,
              rb: group.rb,
            });
          } catch (err) {
            logger.error(err.message);
          }
        });

        return apiResponse.success(res, req, "ok");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_history_all = async (req, res) => {
  /**
   * @swagger
   *
   * /group/history/all:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get group history
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group_id
   *         description: Group ID
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.group_id)
      return apiResponse.fail(res, "group id is required in query string");

    const group_id = req.query.group_id;
    const group = await GroupsModel.get_by_where_single({ id: group_id });
    if (!group) return apiResponse.fail(res, "Invalid group id");

    const history = await GroupHistoryModel.get_history_all(group.id);
    return apiResponse.success(res, req, history);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_recent_history = async (req, res) => {
  /**
   * @swagger
   *
   * /group/history/recent:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get group history
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group_id
   *         description: group id
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.group_id)
      return apiResponse.fail(res, "group id is required in query string");

    const group_id = req.query.group_id;
    const group = await GroupsModel.get_by_where_single({ id: group_id });
    if (!group) return apiResponse.fail(res, "Invalid group id");

    const history = await GroupHistoryModel.get_recent_history(group.id);
    return apiResponse.success(res, req, history);
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_history = async (req, res) => {
  /**
   * @swagger
   *
   * /group/history:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get group history
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: group_id
   *         description: group id
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.group_id)
      return apiResponse.fail(res, "group id is required in query string");

    const group_id = req.query.group_id;
    const group = await GroupsModel.get_by_where_single({ id: group_id });
    if (!group) return apiResponse.fail(res, "Invalid group id");

    const history = await GroupHistoryModel.get_history_last(group.id);
    return apiResponse.success(res, req, history);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_history = (req, res) => {
  /**
   * @swagger
   *
   * /group/history:
   *   post:
   *     security: []
   *     description: Set group history.
   *     tags: [Group]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: set
   *         description: Device action
   *         in: formData
   *         required: true
   *         type: string
   *       - name: group_id
   *         description: group id
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.body, {
      set: "required|json",
      group_id: "required",
      // action_from: 'required|in:webapp,mobileapp,device',
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const group = await GroupsModel.get_by_where_single({
          id: req.body.group_id,
        });

        if (!group) return apiResponse.fail(res, "Invalid group id");

        const history = await GroupHistoryModel.save_history({
          group_id: group.id,
          action: req.body.set,
          // action_from: req.body.action_from
        });
        return apiResponse.success(res, req, history);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
