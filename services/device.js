const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const models = require("../models");
const Device = models.Device;
const DScopeReports = models.DScopeReports;

const OrganizationModel = require("../services/organization");
const UserModel = require("../services/user");
const UserDevicePaymentsModel = require("../services/user_device_payments");

const FvReportsModel = require("../services/fv_reports");
const billing_func = require("../common/billing_func");

const helper = require("../common/helper");
const settings = require("../config/settings");
const moment = require("moment");
const config = require("../config/config");
const { deviceSettings } = require("../config/config");
const { logger } = require("../logger");
const ServiceError = require("../utils/serviceError");

function serialExists(serial) {
  return Device.count({
    where: {
      serial: serial,
    },
  })
    .then((count) => {
      if (count > 0) {
        return true;
      } else {
        return false;
      }
    })
    .catch((err) => {
      logger.error(err);
      return false;
    });
}

exports.list = async (perPage, page, device_type = false) => {
  const where = {};
  if (device_type) {
    if (device_type.indexOf(",") > -1) {
      device_type = device_type.split(",");
    }

    where.device_type = device_type;
  }

  let devices = await Device.findAll({
    attributes: [
      "id",
      "serial",
      "pin_code",
      "status",
      "owner_id",
      "live_status",
      "device_type",
      "grace_period",
      "trial_period",
      "bill_cleared",
      "enable_bill",
      "hw_ver",
      "mac",
      "versions",
      "device_ip",
    ],
    where: where,
    include: [
      /* {
        as: 'Remote',
        model: models.Remote,
      }, */
      {
        as: "Device_Type",
        model: models.Product,
        attributes: ["title"],
      },
      {
        as: "Owner",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "DeviceName",
        model: models.Organization_Device,
        attributes: ["device_name"],
      },
    ],
  });

  const formattedDevices = devices.map((item) => {
    const { DeviceName, ...rest } = item.dataValues;
    return { device_name: DeviceName.device_name || item.serial, ...rest };
  });
  return formattedDevices;
};

exports.super_list = (fv = false, resetc = false) => {
  return new Promise((resolve, reject) => {
    const query = {
      attributes: [
        "id",
        "serial",
        "pin_code",
        "status",
        "owner_id",
        "live_status",
        "fv",
        "lst",
        "fi",
        "new_fv",
        "stage",
        "slack_notifications",
        "device_type",
        "bill_cleared",
        "enable_bill",
        "hw_ver",
        "mac",
        "versions",
        "device_ip",
      ],
      where: {},
      group: ["id"],
      include: [
        {
          as: "Device_Type",
          model: models.Product,
          attributes: ["title"],
        },
        {
          as: "Owner",
          model: models.Organization,
          attributes: ["name"],
        },
        {
          as: "Log_Counts",
          model: models.Device_Log_Counts,
          attributes: [
            "v0_lp",
            "v0_hp",
            "v0_info",
            "vp_lp",
            "vp_hp",
            "vp_info",
          ],
        },
        {
          as: "Group",
          model: models.Organization_Device_Groups_Items,
          attributes: ["organization_device_group_id"],
          include: [
            {
              as: "Organization_Device_Group",
              model: models.Organization_Device_Groups,
              required: false,
              attributes: ["name", "orgId"],
            },
          ],
        },
      ],
    };
    if (fv) {
      query.where.fv = fv;
    }
    if (resetc) {
      query.include.push({
        as: "Fv_Resets",
        model: models.Fv_Resets,
        required: false,
        attributes: ["id", "resets"],
        where: { fv: fv },
        limit: 1,
        order: [["id", "DESC"]],
      });
    }

    Device.findAll(query)
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        logger.error(err);
        reject({
          message: err,
        });
      });
  });
};

exports.get_ungrouped_devices = (orgId) => {
  let where = {};
  if (orgId) where.owner_id = orgId;
  return new Promise((resolve, reject) => {
    Device.findAll({
      attributes: [
        "id",
        "owner_id",
        "serial",
        "live_status",
        "bill_cleared",
        "enable_bill",
      ],
      include: [
        {
          as: "Organization_Devices",
          model: models.Organization_Device,
        },
        {
          as: "Organization_Device_Groups_Items",
          model: models.Organization_Device_Groups_Items,
          require: false,
          attributes: ["organization_device_group_id", "orgId", "device_id"],
        },
      ],
      where,
    })
      .then(async (result) => {
        if (result) {
          const devices = [];
          for await (let key of Object.keys(result)) {
            if (result[key].Organization_Device_Groups_Items.length <= 0) {
              const device = result[key];
              let device_name =
                device.Organization_Devices[0].device_name || device.serial;
              devices.push({
                device_id: device.id,
                owner_id: device.owner_id,
                serial: device.serial,
                name: device_name,
                bill_cleared: device.bill_cleared,
              });
            }
          }
          resolve(devices);
        } else {
          resolve(result);
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    const self = this;
    serialExists(params.serial)
      .then((is_exists) => {
        if (is_exists) {
          if (
            params.controller &&
            (params.controller == true || params.controller == "true")
          ) {
            Device.update(params, {
              where: {
                serial: params.serial,
              },
            })
              .then((updated_device) => {
                Device.findOne({
                  attributes: ["id"],
                  where: {
                    serial: params.serial,
                  },
                  raw: true,
                })
                  .then((data) => {
                    resolve({
                      id: data.id,
                      already_exists: true,
                    });
                  })
                  .catch((err) => {
                    reject({
                      message: err,
                    });
                  });
              })
              .catch((err) => {
                reject({
                  message: err,
                });
              });
          } else {
            reject("exists");
          }
        } else {
          // Create new
          Device.create(params)
            .then((data) => {
              const device_initial_settings = {
                timezone_name: settings.get("default_tz_for_device").tz,
                ...deviceSettings.deviceType[params.device_type],
              };
              const UserDeviceSettingsModel = require("./user_device_settings");
              UserDeviceSettingsModel.save_settings(
                { settings: device_initial_settings, geofence_id: null },
                data.owner_id,
                data.id,
              );
              if (global.mqtt_connection_ok) {
                helper.mqtt_publish_message(
                  `d/${data.id}/gs/config`,
                  device_initial_settings,
                );
              }

              if (
                params.controller &&
                (params.controller == true || params.controller == "true")
              ) {
                resolve({
                  id: data.id,
                  already_exists: false,
                });
              } else {
                self
                  .findBySerial(data.serial)
                  .then((device) => {
                    resolve(device);
                  })
                  .catch((err) => {
                    logger.error(err);
                    reject({
                      message: err,
                    });
                  });
              }
            })
            .catch((err) => {
              reject({
                message: err,
              });
            });
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.loginOperator = async (
  id,
  { operatorName, operatorId, operatorLoginTime },
) => {
  return await this.update(id, { operatorName, operatorId, operatorLoginTime });
};

exports.logoutOperator = async (id, { operatorId }) => {
  return await this.update_where(
    { operatorName: null, operatorId: null, operatorLoginTime: null },
    { id, operatorId },
  );
};

exports.update = (id, device) => {
  return new Promise((resolve, reject) => {
    Device.update(device, {
      where: {
        id: id,
      },
    })
      .then((device) => {
        if (device) {
          resolve(device);
        } else {
          reject("There is a problem. Please try later.");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.update_where = (params, where) => {
  return new Promise((resolve, reject) => {
    Device.update(params, {
      where: where,
    })
      .then((device) => {
        resolve(device);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.attach_child_device = (params) => {
  return new Promise((resolve, reject) => {
    Device.update(
      {
        parent: params.device_id,
      },
      {
        where: {
          id: params.child_device_id,
        },
      },
    )
      .then((device) => {
        resolve(device);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.detach_child_device = (params) => {
  return new Promise((resolve, reject) => {
    Device.update(
      {
        parent: 0,
      },
      {
        where: {
          id: params.child_device_id,
          parent: params.device_id,
        },
      },
    )
      .then((device) => {
        resolve(device);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.set_owner = (owner_id, device_id) => {
  return new Promise((resolve, reject) => {
    Device.update(
      {
        owner_id: owner_id,
      },
      {
        where: {
          id: device_id,
        },
      },
    )
      .then((device) => {
        if (device) {
          resolve(device);
        } else {
          reject("There is a problem. Please try later.");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.set_owner_with_bill_info = (params) => {
  return new Promise((resolve, reject) => {
    Device.update(
      { owner_id: params.owner_id },
      {
        where: {
          id: params.device.id,
        },
      },
    )
      .then(async (device) => {
        if (device) {
          const now = moment();
          const grace_period = params.device.grace_period;
          const trial_period = params.device.trial_period;
          const trial_ended = trial_period <= 0;
          const bill = !!(
            params.product.installments || params.product.subscription
          );

          const user_device_payments_obj = {
            user_id: params.owner_id,
            device_id: params.device.id,
            device_type: params.product.id,
            bill: bill,
            otp: params.product.price,
            installments: params.product.installments,
            installment_total_price: params.product.installment_total_price,
            installment_per_month_price:
              params.product.installment_per_month_price,
            subscription: params.product.subscription,
            subscription_price: params.product.subscription_price,

            billpaid: now,
            reg_date: now,
            grace_period: grace_period,
            trial_period: trial_period,
            trial_ended: trial_ended,
          };

          if (bill) {
            const bill_data = await billing_func.get_billing_attr_on_owner_reg({
              trial_period: trial_period,
              trial_ended: trial_ended,
              grace_period: grace_period,
            });

            user_device_payments_obj.billexpiry = moment(
              bill_data.billexpiry,
            ).format("YYYY-MM-DD HH:mm:ss");
            user_device_payments_obj.next_bill_date = moment(
              bill_data.next_bill_date,
            ).format("YYYY-MM-DD");
          }

          UserDevicePaymentsModel.create(user_device_payments_obj)
            .then((result) => {
              // create first invoice
              billing_func.create_first_billing_invoice(result);
              resolve(result);
            })
            .catch(() => {
              reject("user device payment query fail.");
            });
        } else {
          reject("There is a problem. Please try later.");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.set_live_status = (device_id, status) => {
  return new Promise((resolve, reject) => {
    Device.update(
      {
        live_status: status,
      },
      {
        where: {
          id: device_id,
        },
      },
    )
      .then((device) => {
        resolve(device);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.get_device_child_devices = (params) => {
  return new Promise((resolve, reject) => {
    Device.findOne({
      attributes: ["id", "serial"],
      where: {
        id: params.device_id,
        owner_id: params.user_id,
      },
      include: [
        {
          as: "ChildDevices",
          model: models.Device,
          attributes: ["id", "serial", "device_type"],
          where: { owner_id: params.user_id },
          required: false,
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

// organization id is mandatory for organizational users (jazz, ufone)
// organizational users can only access devices under their organization
// no need for orgaization id if the user is admin or super admin

// organization id is mandatory for organizational users (jazz, ufone)
// organizational users can only access devices under their organization
// no need for orgaization id if the user is admin or super admin

exports.findById = (id, orgId = null) => {
  let where = { id };
  if (orgId) where.owner_id = orgId;
  return new Promise((resolve, reject) => {
    // const organization_device = {
    //   as: 'Organization_Devices',
    //   model: models.Organization_Device,
    //   required: false,

    //   // attributes: ['user_id', 'device_name', 'device_id', 'status', 'share_by', 'can_share', 'remote_id', 'device_type'],
    // }
    Device.findOne({
      attributes: [
        "id",
        "serial",
        "status",
        "owner_id",
        "device_type",
        "live_status",
        "fv",
        "bill_cleared",
        "trial_period",
        "grace_period",
        "enable_bill",
        "sims",
        "lst",
        "fi",
        "wi",
        "ii",
      ],
      where,
      include: [
        /* {
            as: 'Remote',
            model: models.Remote,
            require: false,
          }, */
        {
          as: "Device_Type",
          model: models.Product,
          attributes: ["title"],
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
              required: false,
              attributes: ["name", "orgId"],
            },
          ],
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
      ],
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.findById_with_settings = (id) => {
  return new Promise((resolve, reject) => {
    Device.findOne({
      attributes: [
        "id",
        "serial",
        "owner_id",
        "status",
        "live_status",
        "lst",
        "slack_notifications",
        "bill_cleared",
        "enable_bill",
        "device_type",
      ],
      where: {
        id: id,
      },
      include: [
        {
          as: "Settings",
          model: models.Organization_Device_settings,
          attributes: ["id", "geofence_id", "schedule_id", "settings"],
        },
      ],
    })
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject("Device not found");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.findById_with_select = (id, select) => {
  return new Promise((resolve, reject) => {
    Device.findOne({
      attributes: select,
      where: {
        id: id,
      },
    })
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject("Device not found");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.checkDeviceOwner = (serial, owner_id) => {
  return new Promise((resolve, reject) => {
    Device.findOne({
      attributes: [
        "id",
        "serial",
        "owner_id",
        "status",
        "live_status",
        "bill_cleared",
        "enable_bill",
      ],
      where: {
        owner_id: owner_id,
        serial: serial,
      },
    })
      .then((user) => {
        if (user) {
          resolve(user);
        } else {
          reject("User not found");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.findBySerial = (serial, organizationId = null, select = null) => {
  return new Promise((resolve, reject) => {
    const organization_device = {
      as: "Organization_Devices",
      model: models.Organization_Device,
      required: false,
      // attributes: ['user_id', 'device_name', 'device_id', 'status', 'share_by', 'can_share', 'remote_id', 'device_type'],
    };

    if (organizationId) {
      organization_device.where = {
        orgId: organizationId,
      };
    }
    Device.findOne({
      attributes: select || [
        "id",
        "serial",
        "status",
        "owner_id",
        "device_type",
        "live_status",
        "fv",
        "bill_cleared",
        "trial_period",
        "grace_period",
        "enable_bill",
        "sims",
        "lst",
      ],
      where: {
        serial: serial,
      },
      include: [
        /* {
                            as: 'Remote',
                            model: models.Remote,
                            require: false,
                           }, */
        organization_device,
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
              required: false,
              attributes: ["name", "orgId"],
            },
          ],
        },
        {
          as: "Settings",
          model: models.Organization_Device_settings,
          attributes: ["id", "geofence_id", "schedule_id", "settings"],
        },
      ],
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.findBySerial_simple = (serial, select = null) => {
  return new Promise((resolve, reject) => {
    Device.findOne({
      attributes: select || [
        "id",
        "serial",
        "status",
        "owner_id",
        "live_status",
        "fv",
        "bill_cleared",
        "enable_bill",
      ],
      where: {
        serial: serial,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.findBySerials = (serials) => {
  return new Promise((resolve, reject) => {
    Device.findAll({
      attributes: [
        "id",
        "serial",
        "status",
        "owner_id",
        "live_status",
        "bill_cleared",
        "enable_bill",
      ],
      where: {
        serial: serials,
      },
    })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.attach_remote = (remote_id, device_id) => {
  return new Promise((resolve, reject) => {
    Device.update(
      {
        remote_id: remote_id,
      },
      {
        where: {
          id: device_id,
        },
      },
    )
      .then((result) => {
        if (result) {
          resolve(result);
        } else {
          reject("There is a problem. Please try later.");
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.reset = (device_id) => {
  return new Promise((resolve, reject) => {
    OrganizationModel.findByName(config.testOrganization).then(
      (organization) => {
        if (organization) {
          Device.update(
            {
              remote_id: null,
              owner_id: organization.id,
            },
            {
              where: {
                id: device_id,
              },
            },
          )
            .then((result) => {
              models.Organization_Device_Scheduling.destroy({
                where: { device_id: device_id },
              });
              models.Organization_Device.update(
                { orgId: organization.id },
                { where: { device_id: device_id } },
              );
              models.Organization_Device_settings.update(
                {
                  geofence_id: null,
                  schedule_id: null,
                  orgId: organization.id,
                },
                { where: { device_id: device_id } },
              );
              models.Organization_Device_Groups_Items.destroy({
                where: { device_id: device_id },
              });
              helper.mqtt_publish_message(`d/${device_id}/ac/sch`, {
                token: null,
              });
              helper.mqtt_publish_message(`d/${device_id}/ac/group`, {
                group: null,
              });
              resolve(result);
            })
            .catch((err) => {
              reject({
                message: err,
              });
            });
        } else {
          reject("Operation can not be performed");
        }
      },
    );
  });
};

exports.verify_transfer_token = async (params, where) => {
  const invited_user_id = params.invited_user_id || null;
  const attachToOrganization = params.orgId || null;

  const action = params.action || false; // 0 => reject the ownership of the device,  1 => accept the ownership of the device

  if (!mqtt_connection_ok) {
    helper.set_mqtt_connection_lost_log(
      "NAPP queries/devices.js.verify_transfer_token:",
    );
    throw new Error("Connection with broker is down");
  }
  const device = await Device.findOne({ where });
  if (!device) throw new Error("Device not found");

  const old_owner_id = device.owner_id;
  const new_owner_id =
    invited_user_id || attachToOrganization || device.transfer;

  if (!action) {
    /**
     * User has rejected the ownership request.
     * Keep in mind the the owner would be the organization of the user.
     */
    return await Device.update(
      {
        transfer: null,
        transfer_token: null,
      },
      {
        where: {
          id: device.id,
        },
      },
    );
  }

  await Device.sequelize.transaction(async (transaction) => {
    // Update device owner in "Device" table
    const deviceUpdatedRecords = await Device.update(
      { owner_id: new_owner_id, transfer: null, transfer_token: null },
      { where: { id: device.id }, transaction, individualHooks: true },
    );

    if (!deviceUpdatedRecords[0])
      throw new Error("Something bad happened while updating the device");

    /**
     * Update device owner in "OrganizationDevice" table
     * Find device record based on the device id and the old owner id and then update it.
     * The idea is to completely reset the record
     **/
    const organizationDeviceUpdatedRecords =
      await models.Organization_Device.update(
        {
          orgId: new_owner_id,
          can_change_scheduling: true,
          can_change_geo_fence: true,
          share_by: null,
          can_share: true,
        },
        {
          where: { device_id: device.id, orgId: old_owner_id },
          transaction,
          individualHooks: true,
        },
      );

    if (!organizationDeviceUpdatedRecords[0])
      throw new Error(
        "Something bad happened while updating the organziation device",
      );
    /**
     * Update Organization Device Settings based on the device id.
     * The idea is to deattach the device from any schedule and update the owner
     */

    const deviceSettingsUpdatedRecords =
      await models.Organization_Device_settings.update(
        { geofence_id: null, schedule_id: null, orgId: new_owner_id },
        {
          where: { device_id: device.id, orgId: old_owner_id },
          transaction,
          individualHooks: true,
        },
      );
    if (!deviceSettingsUpdatedRecords[0])
      throw new Error(
        "Something bad happened while updating the device settings",
      );

    /**
     * Destroy all records of Organization Device Group Items based on the device id.
     * The idea is to remove this device from any associated group
     */

    await models.Organization_Device_Groups_Items.destroy({
      where: { device_id: device.id },
      transaction,
    });

    /**
     * Destroy Organization Device Scheduling records
     */
    await models.Organization_Device_Scheduling.destroy({
      where: { device_id: device.id },
      transaction,
    });
  });

  // Tell device, kindly leave the group/schedule :p
  helper.mqtt_publish_message(`d/${device.id}/ac/group`, {
    group: null,
  });
  helper.mqtt_publish_message(`d/${device.id}/ac/sch`, {
    token: null,
  });
  // Device.findOne({
  //   attributes: [
  //     "id",
  //     "serial",
  //     "status",
  //     "owner_id",
  //     "live_status",
  //     "transfer",
  //   ],
  //   where: where,
  //   include: [
  //     {
  //       as: "Organization_Devices",
  //       model: models.Organization_Device,
  //       attributes: ["device_name"],
  //       // where: {
  //       //   orgId: models.sequelize.where(
  //       //     models.sequelize.col("Organization_Devices.orgId"),
  //       //     "=",
  //       //     models.sequelize.col("Device.owner_id"),
  //       //   ),
  //       //   device_id: models.sequelize.where(
  //       //     models.sequelize.col("Organization_Devices.device_id"),
  //       //     "=",
  //       //     models.sequelize.col("Device.id"),
  //       //   ),
  //       // },
  //       required: true,
  //     },
  //   ],
  // })
  //   .then((device) => {
  //     if (device) {
  //       const old_owner_id = device.owner_id;
  //       const new_owner_id =
  //         invited_user_id || attachToOrganization || device.transfer;
  //       if (action) {
  //         Device.update(
  //           {
  //             owner_id: new_owner_id,
  //             transfer: null,
  //             transfer_token: null,
  //           },
  //           {
  //             where: {
  //               id: device.id,
  //             },
  //           },
  //         )
  //           .then((result) => {
  //             OrganizationDeviceModel.update_where(
  //               {
  //                 share_by: new_owner_id,
  //               },
  //               {
  //                 device_id: device.id,
  //                 orgId: old_owner_id,
  //               },
  //             )
  //               .then((update_device) => {
  //                 OrganizationDeviceModel.create({
  //                   orgId: new_owner_id,
  //                   device_id: device.id,
  //                   device_name: device.Organization_Devices[0].device_name
  //                     ? device.Organization_Devices[0].device_name
  //                     : device.serial,
  //                 })
  //                   .then((create_device) => {
  //                     const deleteWhere = {
  //                       orgId: {
  //                         [Op.ne]: new_owner_id,
  //                       },
  //                       device_id: device.id,
  //                     };
  //                     OrganizationDeviceModel.deleteWhere(deleteWhere)
  //                       .then((response) => {
  //                         resolve(response);
  //                       })
  //                       .catch((error) => {
  //                         reject(error);
  //                       });
  //                   })
  //                   .catch(() => {
  //                     OrganizationDeviceModel.update_where(
  //                       {
  //                         share_by: null,
  //                         can_share: true,
  //                         can_change_geo_fence: true,
  //                         can_change_scheduling: true,
  //                       },
  //                       {
  //                         orgId: new_owner_id,
  //                         device_id: device.id,
  //                       },
  //                     )
  //                       .then((update_device) => {
  //                         models.Organization_Device_Groups_Items.destroy({
  //                           where: { device_id: device.id },
  //                         })
  //                           .then((group) => { })
  //                           .then((group) => {
  //                             if (mqtt_connection_ok) {
  //                               helper.set_mqtt_connection_lost_log(
  //                                 "NAPP queries/devices.js.verify_transfer_token:",
  //                               );
  //                               helper.mqtt_publish_message(
  //                                 `d/${device.id}/group`,
  //                                 {
  //                                   group: null,
  //                                 },
  //                               );
  //                             }
  //                             resolve(update_device);
  //                           })
  //                           .catch((err) => {
  //                             reject({
  //                               message: err,
  //                             });
  //                           });
  //                       })
  //                       .catch((err) => {
  //                         reject({
  //                           message: err,
  //                         });
  //                       });
  //                   });
  //               })
  //               .catch((err) => {
  //                 reject({
  //                   message: err,
  //                 });
  //               });
  //           })
  //           .catch((error) => {
  //             reject({
  //               message: "Token not exists or may be expire",
  //             });
  //           });
  //       } else {
  //         // Transfer request rejected
  //         Device.update(
  //           {
  //             transfer: null,
  //             transfer_token: null,
  //           },
  //           {
  //             where: {
  //               id: device.id,
  //             },
  //           },
  //         )
  //           .then((result) => {
  //             resolve(result);
  //           })
  //           .catch((error) => {
  //             reject({
  //               message: "Token not exists or may be expire",
  //             });
  //           });
  //       }
  //     } else {
  //       reject({
  //         message: "Token not exists or may be expire",
  //       });
  //     }
  //   })
  //   .catch(() => {
  //     reject({
  //       message: "Token not exists or may be expire",
  //     });
  //   });
};

exports.get_ownership_requests = (orgId) => {
  /**
   * Super admin can see all organizations' device ownership requests
   * The organizational users can only access their own organization's ownership requests
   * If orgId is null it means super admin or admin is tryting to access the ownership requests
   */

  const where = {
    transfer: orgId || { [Op.ne]: null },
  };
  return new Promise((resolve, reject) => {
    Device.findAll({
      attributes: [
        "id",
        "serial",
        "owner_id",
        "transfer",
        "transfer_token",
        "bill_cleared",
        "enable_bill",
      ],
      where,
      include: [
        {
          as: "Owner",
          model: models.Organization,
          attributes: ["name"],
        },
        {
          as: "Organization_Devices",
          model: models.Organization_Device,
          attributes: ["device_name"],
          where: {
            orgId: models.sequelize.where(
              models.sequelize.col("Organization_Devices.orgId"),
              "=",
              models.sequelize.col("Device.owner_id"),
            ),
            device_id: models.sequelize.where(
              models.sequelize.col("Organization_Devices.device_id"),
              "=",
              models.sequelize.col("Device.id"),
            ),
          },
          required: true,
        },
      ],
    }).then((result) => {
      resolve(result);
    });
  });
};

exports.fv_count_update = (fv, old_version) => {
  return new Promise((resolve, reject) => {
    Device.count({
      where: {
        fv: fv,
      },
      // group: ['Device.fv']
    })
      .then((count) => {
        FvReportsModel.setv0({
          fv: fv,
          devices: count,
        })
          .then((result) => {})
          .catch(() => {});
        FvReportsModel.down_fv_device_count({
          fv: fv,
          old_fv: old_version,
        })
          .then((result) => {})
          .catch(() => {});
      })
      .catch((err) => {
        logger.error(err);
        return false;
      });
    /* Device.findOne({
            attributes: [
                [models.sequelize.fn('count', models.sequelize.col('Device.id')), 'total_devices']
            ],
            where: {
                fv: fv
            },
            raw: true,
            group: ['Device.fv']
        }).then(total => {
            FvReportsModel.setv0({
                fv: fv,
                devices: total.total_devices
            }).then(result => {}).catch(err => {});
            FvReportsModel.down_fv_device_count({
                fv: old_version
            }).then(result => {}).catch(err => {});
            resolve(total);
        }).catch(err => {
            reject({
                message: err
            });
        }); */
  });
};

exports.not_cleared_bills = (owner_id) => {
  return new Promise((resolve, reject) => {
    Device.findAll({
      attributes: [
        "id",
        "serial",
        "status",
        "owner_id",
        "device_type",
        "grace_period",
        "trial_period",
        "bill_cleared",
        "enable_bill",
      ],
      where: { bill_cleared: false, owner_id: owner_id },
      include: [
        {
          as: "Owner",
          model: models.User,
          attributes: ["name", "email"],
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.pending_bills = (owner_id) => {
  return new Promise((resolve, reject) => {
    Device.findAll({
      attributes: [
        "id",
        "serial",
        "status",
        "owner_id",
        "device_type",
        "grace_period",
        "trial_period",
        "bill_cleared",
        "enable_bill",
      ],
      where: { enable_bill: true, owner_id: owner_id },
      include: [
        {
          as: "Owner",
          model: models.User,
          attributes: ["name", "email"],
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.get_owner_devices_with_product = () => {
  return new Promise((resolve, reject) => {
    Device.findAll({
      attributes: ["id", "owner_id", "grace_period", "trial_period"],
      where: { owner_id: { [Op.ne]: null } },
      include: [
        {
          as: "Device_Type",
          model: models.Product,
          attributes: [
            "id",
            "price",
            "one_time_payment",
            "subscription",
            "subscription_price",
            "installments",
            "installment_total_price",
            "installment_per_month_price",
          ],
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.getOnlineDevicesCount = async ({ owner_id = false } = {}) => {
  const where = {
    live_status: 1,
  };
  if (owner_id) {
    where.owner_id = owner_id;
  }
  return await Device.count({ where });
};

exports.getOfflineDevicesCount = async ({ owner_id = false } = {}) => {
  const where = {
    live_status: 0,
  };
  if (owner_id) {
    where.owner_id = owner_id;
  }
  return await Device.count({ where });
};

exports.findByIds = async ({ ids = [], orgId = null, deviceType = null }) => {
  const where = {
    status: 1,
  };
  if (ids.length > 0) {
    where.id = ids;
  }
  if (orgId) where.owner_id = orgId;
  if (deviceType) where.device_type = deviceType;
  const devices = await Device.findAll({
    attributes: ["id"],
    where: where,
    include: [
      {
        as: "Settings",
        model: models.Organization_Device_settings,
        attributes: ["settings"],
      },
    ],
  });
  return devices;
};

// function idExists (id) {
//   return Device.count({
//     where: {
//       id: id
//     }
//   }).then(count => {
//     if (count > 0) {
//       return true
//     } else {
//       return false
//     }
//   }).catch(err => {
//     return false
//   })
// };

exports.findByType = async (device_type, orgId) => {
  const where = {
    device_type: device_type,
  };
  if (orgId) where.owner_id = orgId;
  const allDevices = await Device.findAll({
    attributes: [
      "id",
      "serial",
      "pin_code",
      "status",
      "owner_id",
      "live_status",
      "device_type",
      "grace_period",
      "trial_period",
      "bill_cleared",
      "enable_bill",
      "hw_ver",
      "mac",
      "versions",
      "device_ip",
    ],
    where: where,
    include: [
      {
        as: "Device_Type",
        model: models.Product,
        attributes: ["title"],
      },
      {
        as: "Owner",
        model: models.Organization,
        attributes: ["name"],
      },
      {
        as: "Organization_Devices",
        model: models.Organization_Device,
        attributes: ["device_name"],
      },
    ],
  });
  return allDevices;
};

exports.createDscopeReport = async (body) => {
  const query = {
    where: {
      date: body.date,
      serialNumber: body.serialNumber,
      stationSerial: body.stationSerial,
    },
  };
  const reportExists = await DScopeReports.findOne(query);
  let newReport;
  if (!reportExists) newReport = await DScopeReports.create(body);
  else newReport = await reportExists.update(body);
  return newReport;
};

exports.listDscopeReport = async (limit, offset) => {
  const query = {
    limit,
    offset,
    where: {},
  };
  const count = await DScopeReports.count({ where: query.where });
  const data = await DScopeReports.findAll(query);
  return { count, data };
};

exports.getDscopeReportByTestAndStationSerial = async (
  serialNumber,
  stationSerial,
) => {
  const query = {
    where: { serialNumber, stationSerial },
  };
  return await DScopeReports.findOne(query);
};

exports.getDscopeReportByFilters = async ({
  dateBetween = [],
  serialNumber,
  stationSerial,
}) => {
  const where = {};
  if (dateBetween.length > 0) {
    if (dateBetween.length == 1) {
      where.date = dateBetween[0];
    } else if (dateBetween.length == 2) {
      where.date = {
        [Op.between]: dateBetween,
      };
    }
  }

  if (serialNumber) where.serialNumber = serialNumber;
  if (stationSerial) where.stationSerial = stationSerial;

  const query = {
    where: where,
  };
  return await DScopeReports.findOne(query);
};

exports.deleteDscopeReports = async (where = {}) => {
  return await DScopeReports.destroy({
    where: where,
  });
};

exports.deleteWhere = async (where = {}) => {
  return await Device.destroy({
    where: where,
  });
};

exports.find = async (where) => {
  return await Device.findOne({
    where: where,
    include: [
      {
        as: "Group",
        model: models.Organization_Device_Groups_Items,
        attributes: ["organization_device_group_id"],
      },
    ],
  });
};

/**
 * @param {Object} params
 * @param {string} params.device_serial
 * @param {string} params.email_for_device_transfer
 * @returns {object} Device
 */
exports.deviceTransferValidations = async ({
  device_serial,
  email_for_device_transfer,
}) => {
  const device = await this.findBySerial(device_serial, null, [
    "id",
    "serial",
    "transfer",
    "owner_id",
    "bill_cleared",
  ]);

  // If device not found then we return
  if (!device) throw new Error("Invalid device serial");

  // Find the organization for this device
  const testOrganization = await OrganizationModel.findByName(
    config.testOrganization,
  );

  // If device does not belong to the owner, we return
  if (device.owner_id !== testOrganization.id)
    throw new Error("Operation can not be performed!");

  // If the bill is not cleared and the user is not super admin
  // Then the user is not allowed to make changes to device
  if (!device.bill_cleared) {
    throw new Error("device_locked_due_bill_message");
  }

  // If there is already a transfer, then we return

  // Find the user and check that it has the correct credentials
  // And is authorized to make this request
  const transfer_to_user = await UserModel.findByEmail(
    email_for_device_transfer,
  );
  if (!transfer_to_user)
    throw new Error("User with the specified email not found");

  if (transfer_to_user.orgId == device.owner_id)
    throw new Error("Device is already attached to the relevant organization");

  if (helper.hasProvidedRoleRights(transfer_to_user.Role, "admin").success) {
    throw new Error(
      "You can not transfer the device to non-organizational users",
    );
  } else if (
    !helper.hasProvidedRoleRights(transfer_to_user.Role, "manageDevices")
      .success
  ) {
    throw new Error(
      "User with the given email doesn't have required permissions",
    );
  }

  return { device, transfer_to_user };
};

exports.create_device_token = async (deviceId, deviceSerial) => {
  const payload = { id: deviceId, serial: deviceSerial };
  const deviceToken = helper.createDeviceJwtToken(payload);
  if (!deviceToken) {
    throw new ServiceError("No Token Created", 400);
  }
  const prefixedToken = config.device_token_prefix + deviceToken;
  const response = await Device.update(
    { device_token: prefixedToken },
    { where: { id: deviceId } },
  );
  if (!response) {
    throw new ServiceError("Not updated", 400);
  }
  return response;
};
