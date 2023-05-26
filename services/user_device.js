// External Module Imports
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const models = require("../models");
const UserModel = require("../services/user");

const { logger } = require("../logger");

let OrganizationDevices = models.Organization_Device;

const alreadyExists = async (organizationId, device_id) => {
  try {
    const count = await OrganizationDevices.count({
      where: {
        orgId: organizationId,
        device_id: device_id,
      },
    });

    return count > 0;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

const tokenExists = async (token) => {
  try {
    const count = await OrganizationDevices.count({
      where: {
        share_verify_token: token,
      },
    });
    return count > 0;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

exports.get_all_organization_devices = async (
  organizationId = false,
  deviceType = false,
) => {
  const where = {};
  if (deviceType) {
    if (deviceType.indexOf(",") > -1) {
      deviceType = deviceType.split(",");
    }

    where.device_type = deviceType;
  }

  const whereForDevices = {
    status: 1,
    share_by: null,
  };

  if (organizationId) {
    whereForDevices.orgId = organizationId;
  }

  return await OrganizationDevices.findAll({
    where: whereForDevices,
    include: [
      {
        as: "Device",
        model: models.Device,
        where: where,
        attributes: [
          "id",
          "serial",
          "owner_id",
          "live_status",
          "device_type",
          "bill_cleared",
          "enable_bill",
          "hw_ver",
          "versions",
          "device_ip",
          "gc_id",
        ],
        include: [
          {
            as: "Device_Type",
            model: models.Product,
            attributes: ["title"],
          },
          {
            model: models.Course,
            attributes: ["id", "name"],
          },
          {
            as: "Settings",
            model: models.Organization_Device_settings,
            attributes: ["id", "geofence_id", "schedule_id", "settings"],
          },
          {
            as: "Owner",
            model: models.Organization,
            attributes: ["name"],
          },
          {
            as: "Group",
            model: models.Organization_Device_Groups_Items,
            attributes: ["organization_device_group_id"],
            include: [
              {
                as: "Organization_Device_Group",
                model: models.Organization_Device_Groups,
                require: false,
                attributes: ["name"],
              },
            ],
          },
          // join the gc
        ],
      },
    ],
    order: [["device_id", "DESC"]],
  });
};

exports.get_user_devics_key_metrics = async (user_id) => {
  const result = await OrganizationDevices.findAll({
    attributes: ["share_by"],
    where: {
      user_id: user_id,
      status: 1,
    },
    raw: true,
  });

  let myDevices = 0;
  let shareByOther = 0;

  for (let i = 0; i < result.length; i++) {
    if (result[i].share_by) shareByOther += 1;
    else myDevices = myDevices += 1;
  }

  const metrics = {
    total: result.length,
    owned: myDevices,
    share_to_me: shareByOther,
    shared_by_me: 0,
  };

  try {
    const count = await this.user_shared_devices_count(user_id);

    metrics.shared_by_me = count;
    return metrics;
  } catch (error) {
    logger.error(error);
    return metrics;
  }
};

exports.get_organization_devics_key_metrics = async (organizationId) => {
  const result = await OrganizationDevices.findAll({
    where: {
      orgId: organizationId,
      status: 1,
    },
    raw: true,
  });

  let myDevices = 0;
  for (let i = 0; i < result.length; i++) {
    // if (result[i].share_by) {
    //   share_by_other = share_by_other + 1
    // } else {
    myDevices = myDevices + 1;
    // }
  }
  const metrics = {
    total: result.length,
    owned: myDevices,
  };

  return metrics;
};

exports.get_shared_devices = async (device_id) => {
  return await OrganizationDevices.findAll({
    where: {
      device_id: device_id,
      user_id: { [Op.ne]: 0 },
      share_by: { [Op.ne]: null },
    },
    attributes: [
      "id",
      "device_name",
      "status",
      "createdAt",
      "can_share",
      "can_change_geo_fence",
      "can_change_scheduling",
    ],
    include: [
      {
        as: "User",
        model: models.User,
        attributes: ["id", "name", "email", "phone", "profile_image"],
      },
    ],
  });
};

exports.get_shared_devices_requests = async (user_id) => {
  return await OrganizationDevices.findAll({
    where: {
      user_id: user_id,
      status: 0,
      share_by: { [Op.ne]: null },
    },
    attributes: [
      "id",
      "device_id",
      "device_name",
      "status",
      "createdAt",
      "share_by",
      "can_share",
      "can_change_geo_fence",
      "can_change_scheduling",
      "share_verify_token",
    ],
    include: [
      {
        as: "ShareByUser",
        model: models.User,
        attributes: ["name", "email", "profile_image"],
      },
    ],
  });
};

exports.get_all_un_schedule_organization_devices = async (orgId) => {
  const where = {
    status: 1,
    can_change_scheduling: 1,
  };
  if (orgId) where.orgId = orgId;
  return await OrganizationDevices.findAll({
    where,
    attributes: ["device_name"],
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
        include: [
          {
            as: "Settings",
            model: models.Organization_Device_settings,
            attributes: ["id", "schedule_id"],
          },
          {
            as: "Group",
            model: models.Organization_Device_Groups_Items,
            attributes: ["organization_device_group_id"],
          },
        ],
      },
    ],
  });
};

exports.get_user_device = async (user_id, device_id) => {
  const user = await UserModel.findById(user_id);

  return await this.get_org_device(user.orgId, device_id);
};

exports.get_org_device = async (organizationId, device_id) => {
  let where = { device_id };
  if (organizationId) where.orgId = organizationId;
  return await OrganizationDevices.findOne({
    where,
    include: [
      {
        as: "Device",
        model: models.Device,
        include: [
          {
            as: "Device_Type",
            model: models.Product,
            attributes: ["title"],
          },
          {
            as: "Settings",
            model: models.Organization_Device_settings,
            attributes: ["id", "geofence_id", "schedule_id", "settings"],
          },
          {
            as: "Device_Diagnostics",
            model: models.Device_Diagnostics,
          },
          {
            as: "Group",
            model: models.Organization_Device_Groups_Items,
          },
        ],
      },
    ],
  });
};

exports.get_org_device_by_name = async (organizationId, device_name) => {
  return await OrganizationDevices.findOne({
    where: {
      orgId: organizationId,
      device_name,
    },
  });
};

exports.get_user_device_for_invoice = async (user_id, device_id) => {
  return await OrganizationDevices.findOne({
    where: {
      user_id: user_id,
      device_id: device_id,
    },
    attributes: ["device_name"],
    include: [
      {
        as: "Device",
        model: models.Device,
        attributes: ["serial", "bill_cleared", "enable_bill"],
        include: [
          {
            as: "Device_Type",
            model: models.Product,
            attributes: ["title", "description"],
          },
        ],
      },
    ],
  });
};

exports.create = async (params) => {
  const isExists = await alreadyExists(params.orgId, params.device_id);

  if (isExists) throw new Error("exists");

  // Create new
  return await OrganizationDevices.create(params);
};

exports.update_device_name = async (device_name, id) => {
  const result = await OrganizationDevices.update(
    {
      device_name: device_name,
    },
    {
      where: {
        id: id,
      },
    },
  );

  if (!result) throw new Error("There is a problem. Please try later.");
  return result;
};

exports.update_where = async (params, where) => {
  return await OrganizationDevices.update(params, {
    where: where,
  });
};

exports.delete = async (id) => {
  return await OrganizationDevices.destroy({
    where: {
      id: id,
    },
  });
};

exports.deleteWhere = async (where) => {
  return await OrganizationDevices.destroy({
    where: where,
  });
};

exports.verify_shared_token = async (token, type = 1) => {
  const isExists = await tokenExists(token);
  if (!isExists) throw new Error("Token not exists or may be expire");

  try {
    if (type == 0) {
      return await OrganizationDevices.destroy({
        where: { share_verify_token: token },
      });
    } else {
      return await OrganizationDevices.update(
        { share_verify_token: null, status: 1 },
        {
          where: {
            share_verify_token: token,
          },
        },
      );
    }
  } catch (error) {
    logger.error(error);
    throw new Error("Token not exists or may be expire");
  }
};

exports.verify_shared_token_by_invitation = async (token, user_id) => {
  const isExists = await tokenExists(token);
  if (!isExists) throw new Error("Token not exists or may be expire");

  try {
    return await OrganizationDevices.update(
      {
        user_id: user_id,
        share_verify_token: null,
        status: 1,
      },
      {
        where: {
          share_verify_token: token,
        },
      },
    );
  } catch (error) {
    logger.error(error);
    throw new Error("Token not exists or may be expire");
  }
};

exports.user_total_devices_count = async (user_id) => {
  try {
    return await OrganizationDevices.count({
      where: {
        user_id: user_id,
        status: 1,
      },
    });
  } catch (error) {
    logger.error(error);
    return 0;
  }
};

exports.user_shared_devices_count = async (user_id) => {
  try {
    return await OrganizationDevices.count({
      where: {
        share_by: user_id,
      },
    });
  } catch (error) {
    logger.error(error);
    return 0;
  }
};

exports.getDeviceDetails = async (deviceId) => {
  const deviceDetails = await OrganizationDevices.findOne({
    where: { device_id: deviceId },
  });
  if (!deviceDetails) throw new Error("No device found with provided id");
  return deviceDetails;
};

exports.getOrganizationDevicesById = async (deviceId, orderBy) => {
  const result = await OrganizationDevices.findAll({
    where: {
      device_id: deviceId,
    },
    order: orderBy,
  });

  if (result.length <= 0) throw new Error("Organization devices not found");
  return result;
};
