const models = require("../models");
const Groups = models.Organization_Device_Groups;
const GroupHistoryModel = require("../services/group_history");
const helper = require("../common/helper");

const randtoken = require("rand-token");

const { logger } = require("../logger");

module.exports.list = async (orgId, perPage, page) => {
  let where = {};
  if (orgId) where.orgId = orgId;
  let groups = await Groups.findAll({
    where,
    include: [
      {
        as: "Organization_Device_Groups_Items",
        model: models.Organization_Device_Groups_Items,
        require: false,
        attributes: ["organization_device_group_id", "orgId", "device_id"],
        include: [
          {
            as: "Device",
            model: models.Device,
            require: false,
            attributes: [
              "id",
              "serial",
              "live_status",
              "bill_cleared",
              "enable_bill",
            ],
            include: [
              {
                as: "Organization_Devices",
                model: models.Organization_Device,
                require: false,
                where,
                attributes: ["device_name"],
              },
            ],
          },
        ],
      },
    ],
  });

  // Modify the response to return "device_name" instead of "Device" object
  const modifiedGroups = groups.map((group) => {
    const modifiedItems = group.Organization_Device_Groups_Items.map((item) => {
      return {
        organization_device_group_id: item.organization_device_group_id,
        orgId: item.orgId,
        device_id: item.device_id,
        name:
          item.Device.Organization_Devices[0].device_name || item.Device.serial,
      };
    });
    return {
      ...group.dataValues,
      Organization_Device_Groups_Items: modifiedItems,
    };
  });
  return modifiedGroups;
};

module.exports.super_list = async (perPage, page) => {
  let groups = await Groups.findAll({
    include: [
      {
        as: "Owner",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "Organization_Device_Groups_Items",
        model: models.Organization_Device_Groups_Items,
        require: false,
        attributes: ["organization_device_group_id", "orgId", "device_id"],
        include: [
          {
            as: "Device",
            model: models.Device,
            require: false,
            attributes: [
              "id",
              "serial",
              "live_status",
              "bill_cleared",
              "enable_bill",
            ],
            include: [
              {
                as: "Organization_Devices",
                model: models.Organization_Device,
                require: false,
                attributes: ["device_name"],
              },
            ],
          },
        ],
      },
    ],
  });

  // Modify the response to return "device_name" instead of "Device" object
  const modifiedGroups = groups.map((group) => {
    const modifiedItems = group.Organization_Device_Groups_Items.map((item) => {
      return {
        organization_device_group_id: item.organization_device_group_id,
        orgId: item.orgId,
        device_id: item.device_id,
        name:
          item.Device.Organization_Devices[0].device_name || item.Device.serial,
      };
    });
    return {
      ...group.dataValues,
      Organization_Device_Groups_Items: modifiedItems,
    };
  });
  return modifiedGroups;
};

exports.get_by_where = async (where) => {
  return await Groups.findAll({
    where: where,
  });
};

exports.get_by_where_single = async (where) => {
  return await Groups.findOne({
    where: where,
  });
};

exports.findByID = async (id, orgId) => {
  let where = {};
  if (orgId) where.orgId = orgId;
  return await Groups.findOne({
    where: { ...where, id: id },
    include: [
      {
        as: "Organization_Device_Groups_Items",
        model: models.Organization_Device_Groups_Items,
        require: false,
        attributes: ["organization_device_group_id", "orgId", "device_id"],
        include: [
          {
            as: "Device",
            model: models.Device,
            require: false,
            attributes: [
              "id",
              "serial",
              "live_status",
              "bill_cleared",
              "enable_bill",
              "device_type",
            ],
            include: [
              {
                as: "Organization_Devices",
                model: models.Organization_Device,
                require: false,
                where,
                attributes: ["device_name"],
              },
            ],
          },
        ],
      },
    ],
  });
};

exports.create = async (params) => {
  params.mqtt_token = randtoken.generate(10);
  const data = await Groups.create(params);

  try {
    return await this.findByID(data.id, data.orgId);
  } catch (error) {
    logger.error(error);
    return data;
  }
};

exports.update = async (id, params) => {
  return await Groups.update(params, { where: { id: id } });
};

exports.delete = async (id) => {
  const result = await Groups.destroy({ where: { id: id } });

  if (!result) throw new Error("There is a problem. Please try later.");
  return result;
};

exports.find = async (where) => {
  return await Groups.findOne({
    where,
  });
};

exports.updateByWhere = async (params, where) => {
  return await Groups.update(params, { where });
};

exports.deleteAll = async (where = {}) => {
  return await Groups.destroy({ where });
};

exports.getCSVOfDeviceIdsInAGroup = async (groupId, orgId) => {
  const group = await this.findByID(groupId, orgId);
  const deviceIdsInGroup =
    group?.Organization_Device_Groups_Items?.map((item) => item?.device_id) ||
    [];
  const csvDeviceIds = deviceIdsInGroup.join(",");
  return csvDeviceIds;
};

exports.updateGroupStateOnDeviceLinkOrUnlink = async (groupId) => {
  const currentGroupState = await GroupHistoryModel.getLastGroupStateChange(
    groupId,
  );
  if (currentGroupState?.action) {
    // Group change add action here
  }
};
