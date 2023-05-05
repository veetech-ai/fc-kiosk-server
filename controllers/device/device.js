// External Module Imports
global.WebSocket = require("ws");
const Validator = require("validatorjs");
const moment = require("moment-timezone");

// Query Imports
const DeviceModel = require("../../services/device");
const OrganizationDeviceModel = require("../../services/user_device");
const UserDeviceSchedulingModel = require("../../services/user_device_scheduling");
const OrganizationDeviceSettingsModel = require("../../services/user_device_settings");
const DeviceHistoryModel = require("../../services/device_history");
const DeviceWifiModel = require("../../services/device_wifis");
const UserModel = require("../../services/user");
const OrganizationModel = require("../../services/organization");
const DeviceDiagnosticsModel = require("../../services/device_diagnostics");
const UserInvitations = require("../../services/user_invitations");
const FirmwareModel = require("../../services/firmware");
const DeviceMetadataModel = require("../../services/device_metadata");
const DeviceVPLogsModel = require("../../services/device_vp_logs");
const ProductModel = require("../../services/product");

const { calculateTimeBounds } = require("../../services/devices");

// Common Imports
const apiResponse = require("../../common/api.response");
const { getFileURL } = require("../../common/upload");
const email = require("../../common/email");
const helper = require("../../common/helper");
const printer = require("../../common/label_printer");
const notification = require("../../common/notification");

const { products } = require("../../common/products");

// Configuration Imports
const settings = require("../../config/settings");
const config = require("../../config/config");

// Logger Imports
const { logger } = require("../../logger");

// Helper Imports
const { register_with_new_user, objectsEqual } = require("./helper");

/**
 * @swagger
 * tags:
 *   name: Device
 *   description: Device management
 */

exports.get_all = async (req, res) => {
  /**
   * @swagger
   *
   * /device/all:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Devices (Only Admin)
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_type
   *         description: Device Type can be 1=autma, 2=geyser, 3=solar, 4=motor, 5=tank, 6=motor and tank, 7=enery audit OR also can be comma separated values like, 1,2,5,6 etc
   *         in: query
   *         required: false
   *         type: string
   *       - name: sa
   *         description: Detail data for super admin
   *         in: query
   *         required: false
   *         type: number
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

    if (req.query.sa) {
      const result = await DeviceModel.super_list(
        req.query.fv ? req.query.fv : false,
        req.query.resetc || false,
      );

      return apiResponse.success(res, req, result);
    } else {
      const result = await DeviceModel.list(
        limit,
        page,
        req.query.device_type ? req.query.device_type : false,
      );

      return apiResponse.success(res, req, result);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_devices = async (req, res) => {
  /**
   * @swagger
   *
   * /device/my:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get organization devices if logged in user is an organizational user, otherwise all devices
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_type
   *         description: Device Type can be 1=autma, 2=geyser, 3=solar, 4=motor, 5=tank, 6=motor and tank, 7=enery audit OR also can be comma separated values like, 1,2,5,6 etc
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const result = await OrganizationDeviceModel.get_all_organization_devices(
      !req.user.admin ? req.user.orgId : false,
      req.query.device_type ? req.query.device_type : false,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.getById = async (req, res) => {
  /**
   * @swagger
   *
   * /device/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device by id
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Device id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  let organizationId = null;
  const deviceId = req.params.id;
  try {
    if (!req.user.admin) {
      organizationId = req.user.orgId;
    } else {
      const device = await DeviceModel.findById(deviceId);
      if (device) {
        organizationId = device.owner_id;
      } else {
        return apiResponse.fail(res, "Invalid Device id or serial");
      }
    }
    const orgDevice = await OrganizationDeviceModel.get_org_device(
      organizationId,
      deviceId,
    );
    if (orgDevice) {
      apiResponse.success(res, req, orgDevice);
    } else {
      apiResponse.fail(res, "The device does not belong to your organization");
    }
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_by_serial = async (req, res) => {
  /**
   * @swagger
   *
   * /device/get/{serial}/{isId}:
   *   get:
   *     deprecated: true
   *     security:
   *      - auth: []
   *     description: Get device by serial
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: serial
   *         description: Device serial
   *         in: path
   *         required: true
   *         type: string
   *       - name: isId
   *         description: shows whether the first param has serial or id. Accepted value => 'yes'
   *         in: path
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    let organizationId = null;

    if (!req.user.admin) {
      organizationId = req.user.orgId;
    }

    if (req.params.isId && req.params.isId === "yes") {
      const deviceId = req.params.id;

      if (req.user.admin) {
        const device = await DeviceModel.findById(deviceId);
        if (device) {
          organizationId = device.owner_id;
        } else {
          return apiResponse.fail(res, "Invalid Device id or serial");
        }
      }

      const orgDevice = await OrganizationDeviceModel.get_org_device(
        organizationId,
        deviceId,
      );

      if (orgDevice) {
        return apiResponse.success(res, req, orgDevice);
      } else {
        return apiResponse.fail(
          res,
          "The device does not belong to your organization",
        );
      }
    } else {
      const result = await DeviceModel.findBySerial(
        req.params.serial,
        organizationId,
      );

      return apiResponse.success(res, req, result);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /device/create:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new device (Only Admin)
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: serial
   *         description: serial fo device (channel identifier)
   *         in: formData
   *         required: true
   *         type: string
   *       - name: pin_code
   *         description: Device Pin code
   *         in: formData
   *         required: true
   *         type: string
   *       - name: controller
   *         description: Just flag to know that request coming from controller or not
   *         in: formData
   *         required: false
   *         type: boolean
   *       - name: password
   *         description: Device password
   *         in: formData
   *         required: false
   *         type: string
   *       - name: mac
   *         description: mac address
   *         in: formData
   *         required: false
   *         type: string
   *       - name: hw_ver
   *         description: Device hardware version
   *         in: formData
   *         required: false
   *         type: string
   *       - name: ssid
   *         description: ssid
   *         in: formData
   *         required: false
   *         type: string
   *       - name: device_type
   *         description: Device Type can be Fiber aligner =21, Power cable tester=22, Data Pixel D-scope=23, Stationary Beacon=24, Mobile Beacon=25
   *         in: formData
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      serial: "required",
      pin_code: "required",
      device_type: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const { serial, pin_code, device_type, hw_ver } = req.body;
      try {
        const product = await ProductModel.findByID(req.body.device_type);
        if (!product) return apiResponse.fail(res, "Device type not found");

        const grace_period =
          req.body.grace_period || req.body.grace_period == 0
            ? req.body.grace_period
            : product.grace_period;

        const trial_period =
          req.body.trial_period || req.body.trial_period == 0
            ? req.body.trial_period
            : product.trial_period;

        let ownerId;

        try {
          if (req.user.orgId) {
            ownerId = req.user.orgId;
          } else {
            // attach with test user if added by admin
            const organization = await OrganizationModel.findByName(
              config.testOrganization,
            );
            ownerId = organization.id;
          }
        } catch {
          return apiResponse.fail(res, req, "Error in Organization");
        }

        try {
          const created_device = await DeviceModel.create({
            serial,
            pin_code,
            device_type,
            grace_period,
            trial_period,
            owner_id: ownerId,
            hw_ver,
          });
          DeviceModel.createDeviceToken(
            created_device.id,
            created_device.serial,
          );
          try {
            await DeviceModel.set_owner_with_bill_info({
              owner_id: ownerId,
              product: product,
              device: created_device,
            });

            await OrganizationDeviceModel.create({
              orgId: ownerId,
              device_id: created_device.id,
            });

            return apiResponse.success(res, req, created_device);
          } catch (err) {
            if (err == "exists") {
              return apiResponse.success(res, req, created_device);
            } else {
              return apiResponse.success(res, req, created_device);
            }
          }
        } catch (err) {
          if (err == "exists") {
            try {
              const device = await DeviceModel.findBySerial(req.body.serial);

              return apiResponse.success(res, req, device);
            } catch (error) {
              return apiResponse.fail(res, "Device already exists", 422);
            }
          } else {
            return apiResponse.fail(res, err.message, 500);
          }
        }
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_schedule_old = (req, res) => {
  /**
   * @swagger
   *
   * /device/schedule/{serial}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device schedule by serial
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: serial
   *         description: Device serial
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    DeviceModel.findBySerial(req.params.serial)
      .then((device) => {
        if (device) {
          OrganizationDeviceModel.get_user_device(req.user.id, device.id)
            .then((result) => {
              if (result) {
                UserDeviceSchedulingModel.get_device_schedule(result.device_id)
                  .then((schedule) => {
                    apiResponse.success(res, req, schedule);
                  })
                  .catch((err) => {
                    apiResponse.fail(res, err.message, 500);
                  });
              } else {
                apiResponse.fail(
                  res,
                  "This device is not belongs to provided user",
                );
              }
            })
            .catch((err) => {
              apiResponse.fail(res, err.message, 500);
            });
        } else {
          apiResponse.fail(res, "Invalid device serial");
        }
      })
      .catch((err) => {
        apiResponse.fail(res, err.message, 500);
      });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.update_device = (req, res) => {
  /**
   * @swagger
   *
   * /device/update/{deviceId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update device (Only Admin)
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: serial
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *       - name: pin_code
   *         description: Device`s Pin COde
   *         in: formData
   *         required: true
   *         type: string
   *       - name: hw_ver
   *         description: Device hardware version
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      serial: "required",
      pin_code: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device_id = req.params.deviceId;

        if (!device_id) {
          return apiResponse.fail(res, "Device not found", 404);
        }

        const device = await DeviceModel.findBySerial(req.body.serial);

        let allow_update = false;
        if (device) {
          if (device.id == device_id) {
            allow_update = true;
          }
        } else {
          allow_update = true;
        }

        if (!allow_update)
          return apiResponse.fail(res, "Device already exists", 422);

        await DeviceModel.update(device_id, req.body);

        const updated_device = await DeviceModel.findBySerial(req.body.serial);
        return apiResponse.success(res, req, updated_device);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_user = (req, res) => {
  /**
   * @swagger
   *
   * /device/attach-user:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach user to device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      user_id: "required",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device serial");

        if (!device.owner_id || device.owner_id == req.body.user_id) {
          // new user
          const created_user = await register_with_new_user({
            device: device,
            reset: false,
            user_id: req.body.user_id,
          });

          return apiResponse.success(res, req, created_user);
        }

        try {
          const d_owner = await UserModel.findById(device.owner_id);

          if (!d_owner || d_owner.email != config.testAccountEmail) {
            return apiResponse.fail(res, "Device already registered", 422);
          }

          // owner is test account, so, reset device and register new onwer of device
          const created_user = await register_with_new_user({
            device: device,
            reset: true,
            user_id: req.body.user_id,
          });

          return apiResponse.success(res, req, created_user);
        } catch (err) {
          // user not find, reset device and register new user
          const created_user = await register_with_new_user({
            device: device,
            reset: true,
            user_id: req.body.user_id,
          });

          return apiResponse.success(res, req, created_user);
        }
      } catch (err) {
        if (err == "exists") {
          return apiResponse.fail(res, "Device already exists", 422);
        } else {
          return apiResponse.fail(res, err.message, 500);
        }
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.un_attach_user = (req, res) => {
  /**
   * @swagger
   *
   * /device/un-attach-user:
   *   put:
   *     security:
   *      - auth: []
   *     description: Un Attach user from device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      user_id: "required",
      device_serial: "required",
    });
    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device");

        if (device.owner_id && device.owner_id == req.body.user_id) {
          return apiResponse.fail(
            res,
            "Your are owner of this device. you can`t leave it. You need to transfer it first.",
          );
        }

        const user_device = await OrganizationDeviceModel.get_user_device(
          req.body.user_id,
          device.id,
        );
        if (!user_device)
          return apiResponse.fail(res, "Device already unlinked.");

        await OrganizationDeviceModel.delete(user_device.id);
        return apiResponse.success(res, req, "linked");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.revoke_share_access = (req, res) => {
  /**
   * @swagger
   *
   * /device/revoke-share-access:
   *   put:
   *     security:
   *      - auth: []
   *     description: Revoke Share Access from user
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_id
   *         description: User ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      user_id: "required",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device");

        if (device.owner_id && device.owner_id != req.user.id) {
          return apiResponse.fail(
            res,
            "Your are not allowed to perform this action.",
            403,
          );
        }

        const userDevice = await OrganizationDeviceModel.get_user_device(
          req.body.user_id,
          device.id,
        );
        if (!userDevice)
          return apiResponse.fail(res, "Access already revoked.");

        const user_older_dn = userDevice.device_name || req.body.device_serial;
        await OrganizationDeviceModel.delete(userDevice.id);

        await notification.send({
          notice: `${req.user.name} removed access of ${user_older_dn}`,
          device_id: device.id,
          users: [{ id: req.body.user_id }],
        });

        return apiResponse.success(res, req, "revoked");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.updateDeviceName = (req, res) => {
  /**
   * @swagger
   *
   * /device/{id}/name:
   *   put:
   *     security:
   *      - auth: []
   *     description: Set device name by user.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_name
   *         description: Device name
   *         in: formData
   *         required: true
   *         type: string
   *       - name: id
   *         description: Device id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      device_name: ["required", "regex:/^[A-Za-z0-9]+.*$/"],
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      let organizationId = null;
      const deviceId = req.params.id;
      if (!req.user.admin) {
        organizationId = req.user.orgId;
      }
      if (req.user.admin) {
        try {
          const device = await DeviceModel.findById(deviceId);
          if (device) {
            organizationId = device.owner_id;
          } else {
            apiResponse.fail(res, "Invalid Device id or serial");
          }
        } catch (err) {
          apiResponse.fail(res, err.message, 500);
        }
      }
      try {
        const orgDevice = await OrganizationDeviceModel.get_org_device(
          organizationId,
          deviceId,
        );
        if (orgDevice) {
          try {
            const existingDevice =
              await OrganizationDeviceModel.get_org_device_by_name(
                organizationId,
                req.body.device_name,
              );
            if (existingDevice)
              throw {
                message: "Device with same name already existed",
                status: 409,
              };
            const updatedDevice =
              await OrganizationDeviceModel.update_device_name(
                req.body.device_name,
                orgDevice.id,
              );
            apiResponse.success(res, req, updatedDevice);
          } catch (err) {
            apiResponse.fail(res, err.message, err.status || 500);
          }
        } else {
          apiResponse.fail(
            res,
            "The device does not belong to your organization",
          );
        }
      } catch (err) {
        apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
exports.set_device_name = (req, res) => {
  /**
   * @swagger
   *
   * /device/set-device-name:
   *   put:
   *     security:
   *      - auth: []
   *     description: Set device name by user.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_name
   *         description: Device name by user
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_id
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      device_name: "required",
      device_id: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findById(req.body.device_id);
        if (!device) return apiResponse.fail(res, "Invalid device serial");

        const result = await OrganizationDeviceModel.get_org_device(
          req.user.orgId,
          device.id,
        );

        if (!result) {
          return apiResponse.fail(
            res,
            "This device does not belongs to provided user organization",
          );
        }

        const updateResult = await OrganizationDeviceModel.update_device_name(
          req.body.device_name,
          device.id,
        );

        return apiResponse.success(res, req, updateResult);
      } catch (err) {
        apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_schedule_old = (req, res) => {
  /**
   * @swagger
   *
   * /device/set-device-schedule:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set device schedule.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: schedule
   *         description: Device schedule in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );
    const validation = new Validator(req.body, {
      schedule: "required|json",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(
          req.body.device_serial,
          req.user.id,
        );
        if (!device) return apiResponse.fail(res, "Invalid device serial");

        const result = await OrganizationDeviceModel.get_user_device(
          req.user.id,
          device.id,
        );
        if (!result)
          return apiResponse.fail(
            res,
            "This device is not belongs to provided user",
          );

        const update_result = await UserDeviceSchedulingModel.save_schedule(
          req.body.schedule,
          req.user.id,
          result.device_id,
        );

        return apiResponse.success(res, req, update_result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_schedule = async (req, res) => {
  /**
   * @swagger
   *
   * /device/schedule/{serial}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device schedule by serial
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: serial
   *         description: Device serial
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const device = await DeviceModel.findBySerial(req.params.serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    const result = await OrganizationDeviceModel.get_user_device(
      req.user.id,
      device.id,
    );

    if (!result)
      return apiResponse.fail(
        res,
        "This device is not belongs to provided user",
      );

    const schedule = await OrganizationDeviceSettingsModel.get_device_schedule(
      result.device_id,
    );

    return apiResponse.success(res, req, schedule);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_schedule = (req, res) => {
  /**
   * @swagger
   *
   * /device/set-device-schedule:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set device schedule.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: schedule
   *         description: Device schedule in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );
    const validation = new Validator(req.body, {
      schedule: "required|json",
      device_serial: "required",
    });
    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(function () {
      DeviceModel.findBySerial(req.body.device_serial, req.user.id)
        .then((device) => {
          if (device) {
            OrganizationDeviceModel.get_user_device(req.user.id, device.id)
              .then((result) => {
                if (result) {
                  UserDeviceSchedulingModel.save_schedule(
                    req.body.schedule,
                    req.user.id,
                    result.device_id,
                  )
                    .then((update_result) => {
                      apiResponse.success(res, req, update_result);
                    })
                    .catch((err) => {
                      apiResponse.fail(res, err.message, 500);
                    });
                } else {
                  apiResponse.fail(
                    res,
                    "This device is not belongs to provided user",
                  );
                }
              })
              .catch((err) => {
                apiResponse.fail(res, err.message, 500);
              });
          } else {
            apiResponse.fail(res, "Invalid device serial");
          }
        })
        .catch((err) => {
          apiResponse.fail(res, err.message, 500);
        });
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_setting = async (req, res) => {
  /**
   * @swagger
   *
   * /device/settings/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device settings by serial
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Device id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const device = await DeviceModel.findById(req.params.id);
    if (!device) return apiResponse.fail(res, "Invalid device id");

    let result = null;
    if (!req.user.admin) {
      result = await OrganizationDeviceModel.get_org_device(
        req.user.orgId,
        device.id,
      );
    }

    if (!result && !req.user.admin)
      return apiResponse.fail(
        res,
        "This device does not belong to provided user",
      );

    const settings = await OrganizationDeviceSettingsModel.get_device_settings(
      device.id,
    );
    return apiResponse.success(res, req, settings);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_setting = (req, res) => {
  /**
   * @swagger
   *
   * /device/set-device-setting:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set device schedule.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: settings
   *         description: Device schedule in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *       - name: deviceId
   *         description: device id
   *         in: formData
   *         required: true
   *         type: string
   *       - name: organizationId
   *         description: Organization id of the device (in case of super admin)
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: success
   *       400:
   *          description: Offset settings can not contain any other settings
   */
  try {
    Validator.register(
      "json",
      function (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return false;
        }
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      settings: "required|json",
      deviceId: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const device = await DeviceModel.findById(
        req.body.deviceId,
        req.user.orgId,
      );

      // Checking for Invalid Serial
      if (!device) {
        apiResponse.fail(res, "Invalid device serial", 400);
        return;
      }

      // Checking for Validation
      if (
        !device.bill_cleared &&
        !helper.hasProvidedRoleRights(req.user.role, ["super"]).success
      ) {
        apiResponse.fail(
          res,
          settings.get("device_locked_due_bill_message"),
          403,
        );
        return;
      }

      // Getting the user device
      const result = await OrganizationDeviceModel.get_user_device(
        req.user.id,
        device.id,
      );

      // Checking for role access
      if (
        !result &&
        !helper.hasProvidedRoleRights(req.user.role, ["super"]).success
      ) {
        apiResponse.fail(
          res,
          "This device is not belongs to provided user",
          403,
        );
        return;
      }

      // Updating the Device Settings
      const update_result = await OrganizationDeviceSettingsModel.save_settings(
        req.body,
        device.owner_id,
        device.id,
      );

      let deviceSettings = JSON.parse(req.body.settings);

      // settings is JSON encoded string inside a JSON body
      // that's why we may need it to parse again
      if (typeof deviceSettings === "string") {
        deviceSettings = JSON.parse(deviceSettings);
      }

      delete deviceSettings.offset_pixels;
      delete deviceSettings.offset_direction;

      // if deviceSettings is an empty object
      if (!Object.keys(deviceSettings).length) {
        apiResponse.fail(res, "Invalid Setting: no attributes were set", 400);
        return;
      }

      // Sending MQTT Update
      helper.mqtt_publish_message(
        `d/${device.id}/gs/config`,
        deviceSettings,
        true,
      );

      // API Success
      apiResponse.success(res, req, update_result);
    });
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_offset_setting = (req, res) => {
  /**
   * @swagger
   *
   * /device/set-device-setting/offset:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set device schedule.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: settings
   *         description: Device schedule in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *       - name: deviceId
   *         description: device id
   *         in: formData
   *         required: true
   *         type: string
   *       - name: organizationId
   *         description: Organization id of the device (in case of super admin)
   *         type: integer
   *         required: false
   *     responses:
   *       200:
   *         description: success
   *       400:
   *          description: Offset settings can not contain any other settings
   */
  try {
    Validator.register(
      "json",
      function (value) {
        try {
          JSON.parse(value);
          return true;
        } catch (e) {
          return false;
        }
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      settings: "required|json",
      deviceId: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const device = await DeviceModel.findById(
        req.body.deviceId,
        req.user.orgId,
      );

      // Checking for Invalid Serial
      if (!device) {
        apiResponse.fail(res, "Invalid device serial", 400);
        return;
      }

      // Checking for Validation
      if (
        !device.bill_cleared &&
        !helper.hasProvidedRoleRights(req.user.role, ["super"]).success
      ) {
        apiResponse.fail(
          res,
          settings.get("device_locked_due_bill_message"),
          403,
        );
        return;
      }

      // Getting the user device
      const result = await OrganizationDeviceModel.get_user_device(
        req.user.id,
        device.id,
      );

      // Checking for role access
      if (
        !result &&
        !helper.hasProvidedRoleRights(req.user.role, ["super"]).success
      ) {
        return apiResponse.fail(
          res,
          "This device is not belongs to provided user",
          403,
        );
      }

      // Updating the Device Settings
      const update_result = await OrganizationDeviceSettingsModel.save_settings(
        req.body,
        device.owner_id,
        device.id,
      );

      let deviceSettings = JSON.parse(req.body.settings);
      let topic = `d/${device.id}/gs/config/offset`;
      let isRetained = false;

      const offsetKeys = ["offset_pixels", "offset_direction"];
      const settingKeys = Object.keys(deviceSettings);

      // settings is JSON encoded string inside a JSON body
      // that's why we may need it to parse again
      if (typeof deviceSettings === "string")
        deviceSettings = JSON.parse(deviceSettings);

      const isOffsetSetting = settingKeys.every((key) =>
        offsetKeys.includes(key),
      );

      if (!isOffsetSetting || settingKeys.length !== offsetKeys.length) {
        // offset setting must contain only two keys
        const errMsg = `Invalid Setting: offset setings can only contain: ${offsetKeys.join(
          " and ",
        )}`;
        return apiResponse.fail(res, errMsg, 400);
      }

      // Sending MQTT Update
      helper.mqtt_publish_message(topic, deviceSettings, isRetained);

      // API Success
      return apiResponse.success(res, req, update_result);
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_setting_config = async (req, res) => {
  /**
   * @swagger
   *
   * /device/settings/config/{deviceId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Set device schedule.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: device id
   *         in: params
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const device = await DeviceModel.findById(req.params.deviceId);
    if (!device) return apiResponse.fail(res, "Device not found");

    const dat =
      await OrganizationDeviceSettingsModel.get_device_settings_config(
        req.params.deviceId,
      );
    return apiResponse.success(res, req, dat);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_setting_config = (req, res) => {
  /**
   * @swagger
   *
   * /device/settings/config:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set device schedule.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: settings_config
   *         description: Device setting in JSON String
   *         in: formData
   *         required: true
   *         type: string
   *       - name: deviceId
   *         description: device id
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      settings_config: "required|json",
      deviceId: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findById(req.body.deviceId);
        if (!device) return apiResponse.fail(res, "Device not found");

        const dat =
          await OrganizationDeviceSettingsModel.set_device_settings_config(
            req.body.deviceId,
            req.body,
          );

        return apiResponse.success(res, req, dat);
      } catch (error) {
        return apiResponse.fail(res, error.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.share = (req, res) => {
  /**
   * @swagger
   *
   * /device/share:
   *   post:
   *     security:
   *      - auth: []
   *     description: Share device with user
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_email
   *         description: User Email
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      user_email: "required|email",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      let device;
      let user_device;
      try {
        // Try to find the device and return if device not found
        device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device serial.");

        // If device bill not cleared or the user is not super admin, then return
        if (
          !device.bill_cleared &&
          !helper.hasProvidedRoleRights(req.user.role, ["super"]).success
        ) {
          return apiResponse.fail(
            res,
            settings.get("device_locked_due_bill_message"),
          );
        }

        // Find the user device. If not found than we return
        // Also check if user can share this device
        user_device = await OrganizationDeviceModel.get_user_device(
          req.user.id,
          device.id,
        );

        if (!user_device || !user_device.can_share) {
          return apiResponse.fail(
            res,
            "You are not allow to share this device.",
          );
        }

        const user = await UserModel.findByEmail(req.body.user_email);
        if (user.email !== req.user.email) {
          return apiResponse.fail(
            res,
            "You can`t share your device with your self",
          );
        }

        // Now we generate a new token to send to the user
        const token = helper.generate_verify_token();
        const insert = {
          user_id: user.id,
          device_id: device.id,
          share_by: req.user.id,
          can_share: req.body.can_share ? req.body.can_share : false,
          can_change_geo_fence: req.body.can_change_geo_fence
            ? req.body.can_change_geo_fence
            : false,
          can_change_scheduling: req.body.can_change_scheduling
            ? req.body.can_change_scheduling
            : false,
          device_name: user_device.device_name,
          status: 0,
          share_verify_token: token,
        };

        // Create a new User <> Device using this new token
        const created_user_device = await OrganizationDeviceModel.create(
          insert,
        );

        // Send out a notification to this user
        const device_name = user_device.device_name || device.serial;
        await notification.send({
          notice: `A new device ${device_name} is shared with you by ${req.user.name}.`,
          device_id: device.id,
          users: [{ id: user.id }],
          misc: { type: "shared" },
        });

        try {
          await email.send_share_device_verification(user, req.user, token);

          return apiResponse.success(res, req, created_user_device);
        } catch (error) {
          logger.error(error);
          return apiResponse.success(res, req, {
            msg: "Device shared but email not sent",
            record: created_user_device,
          });
        }
      } catch (err) {
        if (err !== "invalidEmail" && err !== "exists") {
          return apiResponse.fail(res, err.message, 500);
        }

        if (err === "exists") {
          return apiResponse.fail(res, "Device already shared.");
        }

        const token = helper.generate_token(40);

        try {
          const invitation = await UserInvitations.create({
            email: req.body.user_email,
            invitation_token: token,
            invite_by_user: req.user.id,
            invite_from: "sharing device",
          });

          const insert = {
            user_id: 0,
            device_id: device.id,
            share_by: req.user.id,
            can_share: req.body.can_share ? req.body.can_share : false,
            can_change_geo_fence: req.body.can_change_geo_fence
              ? req.body.can_change_geo_fence
              : false,
            can_change_scheduling: req.body.can_change_scheduling
              ? req.body.can_change_scheduling
              : false,
            device_name: user_device.device_name,
            status: 0,
            share_verify_token: token,
          };

          const created_user_device = await OrganizationDeviceModel.create(
            insert,
          );

          try {
            await email.send_share_device_invitation_email(
              invitation,
              req.user,
              token,
            );

            return apiResponse.success(res, req, created_user_device);
          } catch (error) {
            logger.error(error);
            return apiResponse.success(res, req, {
              msg: "Device shared but email not sent",
              record: created_user_device,
            });
          }
        } catch (err) {
          if (err.message == "exists") {
            return apiResponse.fail(res, "Device already shared.");
          } else {
            return apiResponse.fail(res, err.message, 500);
          }
        }
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.share_verification = async (req, res) => {
  /**
   * @swagger
   *
   * /device/share-verification/{token}:
   *   get:
   *     security: []
   *     description: Verify share device token
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token, which is sent in email
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const result = await OrganizationDeviceModel.verify_shared_token(
      req.params.token,
    );

    if (result) {
      return apiResponse.success(res, req, "Token verified");
    } else {
      return apiResponse.fail(res, "Invalid token or token may be expire");
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.share_with = async (req, res) => {
  /**
   * @swagger
   *
   * /device/share-with/{serial}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get list of user to whom device is shared
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: serial
   *         description: Device serial
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const device = await DeviceModel.findBySerial(req.params.serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial.");

    if (device.owner_id !== req.user.id)
      return apiResponse.fail(
        res,
        "You are not allowed to get this data.",
        403,
      );

    const user_device = await OrganizationDeviceModel.get_shared_devices(
      device.id,
    );
    return apiResponse.success(res, req, user_device);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.transfer = (req, res) => {
  /**
   * @swagger
   *
   * /device/transfer:
   *   post:
   *     security:
   *      - auth: []
   *     description: transfer device to other user
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: user_email
   *         description: User Email
   *         in: formData
   *         required: true
   *         type: string
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      user_email: "required|email",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        // First we try to find the device
        const { device_serial, user_email: email_for_device_transfer } =
          req.body;
        const { email: logged_in_user_email, name: logged_in_user_name } =
          req.user;
        const { device, transfer_to_user } =
          await DeviceModel.deviceTransferValidations({
            device_serial,
            email_for_device_transfer,
          });

        if (email_for_device_transfer == logged_in_user_email)
          return apiResponse.fail(
            res,
            "You can`t transfer your device with your self",
            400,
          );

        if (device.transfer)
          return apiResponse.fail(res, "Transfer request already generated.");

        const device_name =
          device.Organization_Devices.device_name || device.serial;
        const token = helper.generate_verify_token();
        const update = {
          transfer: transfer_to_user.orgId,
          transfer_token: token,
        };

        // Updated the device. If everything goes correctly then we move forward
        const update_device = await DeviceModel.update_where(update, {
          id: device.id,
        });

        // Send a notification
        notification.send({
          notice: `A new device ${device_name} is transfered to you by ${logged_in_user_name}.`,
          device_id: device.id,
          users: [{ id: transfer_to_user.id }],
          misc: { type: "transfer" },
        });

        // Send the email for device transfer verification
        try {
          await email.send_tranfer_device_verification(
            transfer_to_user,
            req.user,
            token,
          );

          return apiResponse.success(res, req, update_device);
        } catch (error) {
          logger.error(error);
          return apiResponse.success(res, req, {
            msg: "Device transfer request generated but email not sent",
            record: update_device,
          });
        }
      } catch (err) {
        if (err == "invalidEmail") {
          apiResponse.fail(res, "Invalid user email.");
        } else {
          apiResponse.fail(res, err.message, 500);
        }
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.transfer_verification = async (req, res) => {
  /**
   * @swagger
   *
   * /device/transfer-verification/{token}:
   *   get:
   *     security: []
   *     description: Verify transfer device token
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: token
   *         description: Token, which is sent in email
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const where = {
      transfer_token: req.params.token,
    };
    await DeviceModel.verify_transfer_token(
      {
        action: true,
      },
      where,
    );

    return apiResponse.success(res, req, "Token verified");
  } catch (err) {
    logger.error(err);
    return apiResponse.fail(res, "Invalid token or token may be expire");
  }
};

exports.reset = (req, res) => {
  /**
   * @swagger
   *
   * /device/reset:
   *   post:
   *     security:
   *      - auth: []
   *     description: Reset device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device serial.");

        if (
          !device.bill_cleared &&
          !helper.hasProvidedRoleRights(req.user.role, ["super"]).success
        )
          return apiResponse.fail(
            res,
            settings.get("device_locked_due_bill_message"),
          );

        const result = await DeviceModel.reset(device.id);
        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_history_all = async (req, res) => {
  /**
   * @swagger
   *
   * /device/history/all:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device history
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device id
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.deviceId) {
      return apiResponse.fail(res, "Device Id is required in query string");
    }

    const deviceId = req.query.deviceId;
    const device = await DeviceModel.findById(deviceId);
    if (!device) return apiResponse.fail(res, "Invalid device id");

    const history = await DeviceHistoryModel.get_device_history_all(device.id);

    return apiResponse.success(res, req, history);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_recent_history = async (req, res) => {
  /**
   * @swagger
   *
   * /device/history/recent:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device history
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serial)
      return apiResponse.fail(res, "Device serial is required in query string");

    const device_serial = req.query.device_serial;
    const device = await DeviceModel.findBySerial(device_serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    const history = await DeviceHistoryModel.get_device_recent_history(
      device.id,
    );

    return apiResponse.success(res, req, history);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_history = async (req, res) => {
  /**
   * @swagger
   *
   * /device/history:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device history
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serial)
      return apiResponse.fail(res, "Device serial is required in query string");

    const device_serial = req.query.device_serial;
    const device = await DeviceModel.findBySerial(device_serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    const history = await DeviceHistoryModel.get_device_history_last(device.id);

    return apiResponse.success(res, req, history);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_location_history = async (req, res) => {
  /**
   * @swagger
   *
   * /device/history/location:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get location history of tracker device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: query
   *         required: true
   *         type: string
   *       - name: timezone
   *         description: User Local Timezone
   *         in: query
   *         required: true
   *         type: string
   *       - name: filter
   *         description: Filters can be today, yesterday, n(d) e.g 7d // Means last 7 days, and last one is date|date e.g 2020-10-26 16:00:00|2020-10-26 16:10:00
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serial) {
      return apiResponse.fail(res, "Device serial is required in query string");
    }

    const device_serial = req.query.device_serial;
    const device = await DeviceModel.findBySerial(device_serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    req.query.device_id = device.id;
    const tz = req.query.timezone || moment.tz.guess();
    let start = moment
      .utc(moment().tz(tz).startOf("day"))
      .format("YYYY-MM-DD HH:mm:ss");
    let end = moment.utc(moment().tz(tz)).format("YYYY-MM-DD HH:mm:ss");
    let group_interval = "60m";
    let days = 1;

    if (req.query.filter) {
      const filter = req.query.filter;
      if (filter.indexOf("|") > -1) {
        // Range Case
        const range = filter.split("|");
        const sDate = moment(range[0]).tz(tz);
        const eDate = moment(range[1]).tz(tz);
        start = moment.utc(sDate).format("YYYY-MM-DD HH:mm:ss");
        end = moment.utc(eDate).format("YYYY-MM-DD HH:mm:ss");

        days = eDate.diff(sDate, "days");
        if (days > 3 && days <= 10) {
          group_interval = "2h";
        } else if (days > 10) {
          group_interval = "8h";
        }
      } else if (filter.indexOf("today") > -1) {
        // today case
        group_interval = "60m";
        start = moment
          .utc(moment().tz(tz).startOf("day"))
          .add(1, "s")
          .format("YYYY-MM-DD HH:mm:ss");
        end = moment.utc(moment().tz(tz)).format("YYYY-MM-DD HH:mm:ss");
        days = 1;
      } else if (filter.indexOf("yesterday") > -1) {
        // yesterday case
        group_interval = "60m";
        start = moment
          .utc(moment().tz(tz).subtract(1, "days").startOf("day").add(1, "s"))
          .format("YYYY-MM-DD HH:mm:ss");
        end = moment
          .utc(moment().tz(tz).subtract(1, "days").endOf("day"))
          .format("YYYY-MM-DD HH:mm:ss");
        days = 1;
      } else if (filter.indexOf("d") > -1) {
        // Nth days case
        days = parseInt(filter.substring(-1));
        if (days > 3 && days <= 10) {
          group_interval = "2h";
        } else if (days > 10) {
          group_interval = "8h";
        }
        start = moment
          .utc(moment().tz(tz).subtract(days, "days").startOf("day"))
          .format("YYYY-MM-DD HH:mm:ss");
        end = moment
          .utc(moment().tz(tz).subtract(1, "days").endOf("day"))
          .format("YYYY-MM-DD HH:mm:ss");
      }
    }

    const generic_query = `SELECT "lat", "lng", "sp" FROM tracker_data WHERE time > '${start}' AND time < '${end}' AND "device_id"='${req.query.device_id}'  `;
    logger.info(group_interval);

    const data = await helper.send_api_request({
      url: `http://${config.influx.host}:${config.influx.port}/query`,
      method: "get",
      params: {
        db: config.influx.name,
        q: req.query.sq ? req.query.sq : generic_query,
        epoch: "s",
        pretty: true,
      },
    });

    if (data.data.results && data.data.results[0].series) {
      return apiResponse.success(res, req, data.data.results[0].series);
    } else {
      return apiResponse.fail(res, "No data found");
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_history = (req, res) => {
  /**
   * @swagger
   *
   * /device/history:
   *   post:
   *     security: []
   *     description: Set device history.
   *     tags: [Device]
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
   *       - name: device_serial
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      set: "required|json",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) {
          return apiResponse.fail(res, "Invalid device serial");
        }

        const history = await DeviceHistoryModel.save_history({
          device_id: device.id,
          action: req.body.set,
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

exports.get_device_ping = async (req, res) => {
  /**
   * @swagger
   *
   * /device/ping:
   *   get:
   *     security:
   *      - auth: []
   *     description: Ping from device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serial) {
      return apiResponse.fail(res, "Device serial is required in query string");
    }

    const device_serial = req.query.device_serial;
    const device = await DeviceModel.findBySerial(device_serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    const mqttConnection = helper.set_device_forcefully_status(
      device.id,
      "online",
      true,
    );

    if (mqttConnection) {
      return apiResponse.success(res, req, "ok");
    } else {
      return apiResponse.fail(res, "MQTT connection issue");
    }
  } catch (err) {
    apiResponse.fail(res, err.message, 500);
  }
};

exports.historyping = async (req, res) => {
  /**
   * @swagger
   *
   * /device/historyping:
   *   get:
   *     security:
   *      - auth: []
   *     description: Ping from device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serial)
      return apiResponse.fail(res, "Device serial is required in query string");

    const device_serial = req.query.device_serial;
    const device = await DeviceModel.findBySerial(device_serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    const mqttConnection = helper.set_device_forcefully_status(
      device.id,
      "online",
      true,
    );

    if (!mqttConnection)
      return apiResponse.fail(res, "MQTT connection failure.");

    try {
      const history = await DeviceHistoryModel.get_device_history_last(
        device.id,
      );

      return apiResponse.success(res, req, history);
    } catch (err) {
      return apiResponse.success(res, req, {
        ping: "ok",
        history: err.message,
      });
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_wifi_preferred_channel = async (req, res) => {
  /**
   * @swagger
   *
   * /device/wifi/preferred-channel:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device preferred wifi channel info
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serials
   *         description: Device serials (comma separated string of device serials)
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serials)
      return apiResponse.fail(res, "Device serial is required in query string");

    const device_serials = req.query.device_serials.split(",");
    const devices = await DeviceModel.findBySerials(device_serials);
    if (!devices) return apiResponse.fail(res, "Devices not found");

    const device_ids = [];
    for (let i = 0; i < devices.length; i++) {
      device_ids.push(devices[i].id);
    }

    const result = await DeviceWifiModel.get_device_wifi(device_ids);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_wifi_preferred_channel = (req, res) => {
  /**
   * @swagger
   *
   * /device/wifi/preferred-channel:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set device wifi preferred channel.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *       - name: preferred_channel
   *         description: Channel Strength
   *         in: formData
   *         required: true
   *         type: number
   *       - name: current_channel
   *         description: Current Channel Strength
   *         in: formData
   *         required: true
   *         type: number
   *       - name: wifi_ip
   *         description: IP address of Wifi routers
   *         in: formData
   *         required: false
   *         type: string
   *       - name: wifi_ssid
   *         description: WIFI Name, SSID
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.body, {
      preferred_channel: "required",
      current_channel: "required",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device serial");

        req.body.device_id = device.id;
        const result = await DeviceWifiModel.save_wifi(req.body);

        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_diagnostics = async (req, res) => {
  /**
   * @swagger
   *
   * /device/diagnostics:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device diagnostics
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: query
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    if (!req.query.device_serial)
      return apiResponse.fail(res, "Device serial is required in query string");

    const device_serial = req.query.device_serial;
    const device = await DeviceModel.findBySerial(device_serial);
    if (!device) return apiResponse.fail(res, "Invalid device serial");

    const diagnostics = await DeviceDiagnosticsModel.get_device_diagnostics(
      device.id,
    );

    return apiResponse.success(res, req, diagnostics);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_device_diagnostics = (req, res) => {
  /**
   * @swagger
   *
   * /device/diagnostics:
   *   post:
   *     security:
   *       - auth: []
   *     description: Set device diagnostics.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: number
   *         description: Decimal Number
   *         in: formData
   *         required: true
   *         type: number
   *       - name: device_serial
   *         description: Device Serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const validation = new Validator(req.body, {
      number: "required",
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (device) return apiResponse.fail(res, "Invalid device serial");

        const params = helper.get_diagnostics_from_hexa(req.body.number);
        params.device_id = device.id;

        await DeviceDiagnosticsModel.save_diagnostics(params);

        const diagnostics = await DeviceDiagnosticsModel.get_device_diagnostics(
          device.id,
        );
        return apiResponse.success(res, req, diagnostics);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_device_diagnostics = (req, res) => {
  /**
   * @swagger
   *
   * /device/diagnostics/{id}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update device diagnostics.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Device id
   *         in: path
   *         required: true
   *         type: string
   *       - name: timestamp
   *         description: timestamp in milliseconds
   *         in: formData
   *         required: true
   *         type: string
   *       - name: diagnostics
   *         description: Alerts e.g { rfidIdError = true }
   *         in: formData
   *         required: true
   *         type: object
   *     responses:
   *       200:
   *         description: success
   */

  const validation = new Validator(req.body, {
    timestamp: "required|integer",
    diagnostics: "required",
  });

  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      const deviceId = req.params.id;
      let { timestamp, diagnostics } = req.body;

      diagnostics =
        typeof diagnostics === "string" ? JSON.parse(diagnostics) : diagnostics;
      timestamp = Number(timestamp);

      if (Object.keys(diagnostics).length === 0)
        return apiResponse.fail(res, "Diagnostics can not be empty");

      const device = await DeviceModel.findById(deviceId);
      if (!device) return apiResponse.fail(res, "Device not found");

      const isAdminOrSuperAdmin = helper.hasProvidedRoleRights(req.user.role, [
        "super",
        "admin",
      ]).success;

      if (
        isAdminOrSuperAdmin ||
        (!isAdminOrSuperAdmin && req.user.orgId === device.owner_id)
      ) {
        const alertsData =
          helper.schemasPerDeviceType[device.device_type].alertsData;
        const alertsSchema =
          helper.schemasPerDeviceType[device.device_type].alertsSchema;
        const response = await DeviceDiagnosticsModel.save_diagnostics({
          deviceId,
          alerts: diagnostics,
          timestamp,
          alertsData,
          alertsSchema,
        });
        return apiResponse.success(res, req, response);
      } else {
        return apiResponse.fail(res, "Operation can not be performed", 500);
      }
    } catch (error) {
      return apiResponse.fail(res, error.message, 500);
    }
  });
};

exports.device_to_slack = (req, res) => {
  /**
   * @swagger
   *
   * /device/device-to-slack:
   *   post:
   *     security: []
   *     description: CURL
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: url
   *         description: URL
   *         in: formData
   *         required: false
   *         type: string
   *       - name: data
   *         description: Data can be any string or JSON string
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      data: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const log = await helper.set_debugv0(req.body.data, 2);

        const slack_res = await helper.send_slack(
          log,
          req.body.url ? req.body.url : config.slack.deviceToChannel,
        );

        return apiResponse.success(res, req, slack_res.data);
      } catch (err) {
        logger.error(err);
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    logger.error(err);
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_firmware = (req, res) => {
  /**
   * @swagger
   *
   * /device/attach-firmware:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach firmware to device
   *     tags: [Device]
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
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *       - name: rb
   *         description: Rollback (true -> if upgrading and false if downgrading)
   *         in: formData
   *         required: false
   *         type: boolean
   *       - name: outlier
   *         description: Outlier
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
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial(req.body.device_serial);
        if (!device) return apiResponse.fail(res, "Invalid device serial");

        const firmware = await FirmwareModel.findByID(req.body.id, true);
        if (!firmware)
          return apiResponse.fail(res, "Invalid Firmware version provided");

        const result = await DeviceModel.update_where(
          { new_fv: firmware.ver },
          { id: device.id },
        );

        if (mqtt_connection_ok) {
          helper.set_mqtt_connection_lost_log(
            "NAPP device.js.attach_firmware:",
          );

          helper.mqtt_publish_message(`d/${device.id}/s_ota`, {
            version: firmware.ver,
            url: getFileURL(firmware.file),
            hwv: firmware.hw_ver,
            rb: req.body.rb ? req.body.rb : false,
            outlier: req.body.outlier ? req.body.outlier : false,
          });
        }

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
   * /device/attach-bulk-firmware:
   *   post:
   *     security:
   *      - auth: []
   *     description: Attach firmware to bulk devices
   *     tags: [Device]
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
   *       - name: devices
   *         description: JSON string of devices having rb and outlier
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      function (value, requirement, attribute) {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );

    const validation = new Validator(req.body, {
      id: "required",
      devices: "required|json",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const firmware = await FirmwareModel.findByID(req.body.id, true);
        if (!firmware)
          return apiResponse.fail(res, "Invalid Firmware version provided");

        const devices = JSON.parse(req.body.devices);
        await Promise.all(
          devices.map(async (device) => {
            try {
              await DeviceModel.update_where(
                { new_fv: firmware.ver },
                { id: device.device_id },
              );

              if (!mqtt_connection_ok) return;

              helper.set_mqtt_connection_lost_log(
                "NAPP device.js.attach_bulk_firmware:",
              );

              helper.mqtt_publish_message(`d/${device.device_id}/s_ota`, {
                version: firmware.ver,
                url: getFileURL(firmware.file),
                hwv: firmware.hw_ver,
                rb: device.rb,
                outlier: device.outlier,
              });
            } catch (err) {
              logger.err(err.message);
            }
          }),
        );

        return apiResponse.success(res, req, "ok");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_v0_logs = async (req, res) => {
  /**
   * @swagger
   *
   * /device/v0-logs/{serial}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Device logs (Only Super Admin)
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let type = 1;
    if (
      req.query.t &&
      (req.query.t == 1 || req.query.t == 2 || req.query.t == 3)
    ) {
      type = req.query.t;
    }

    const device = await DeviceModel.findBySerial_simple(req.params.serial, [
      "live_status",
      "fv",
      "id",
      "stage",
    ]);

    const result = await DeviceMetadataModel.list_by_where(
      { device_id: device.id, type: type },
      helper.get_pagination_params(req.query),
    );

    return apiResponse.pagination(
      res,
      req,
      {
        device: device,
        logs: result.data,
      },
      result.count,
    );
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_vp_logs = async (req, res) => {
  /**
   * @swagger
   *
   * /device/vp-logs/{serial}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get Device logs (Only Super Admin)
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let type = 1;
    if (
      req.query.t &&
      (req.query.t == 1 || req.query.t == 2 || req.query.t == 3)
    ) {
      type = req.query.t;
    }

    const device = await DeviceModel.findBySerial_simple(req.params.serial, [
      "live_status",
      "fv",
      "id",
      "stage",
    ]);

    const result = await DeviceVPLogsModel.list_by_where(
      { device_id: device.id, type: type },
      helper.get_pagination_params(req.query),
    );

    return apiResponse.pagination(
      res,
      req,
      {
        device: device,
        logs: result.data,
      },
      result.count,
    );
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.print_label = async (req, res) => {
  /**
   * @swagger
   *
   * /device/print-label:
   *   post:
   *     security:
   *      - auth: []
   *     description: Print Device label
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  /**
   * @swagger
   *
   * /device/printlabel:
   *   post:
   *     security:
   *      - auth: []
   *     description: Print Device label
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: device_serial
   *         description: Device serial
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      device_serial: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device = await DeviceModel.findBySerial_simple(
          req.body.device_serial,
          ["id", "serial", "pin_code", "createdAt"],
        );
        if (!device) return apiResponse.fail(res, "Invalid device serial");

        printer.print(device);
        return apiResponse.success(res, req, "ok");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.update_slack_notifications = (req, res) => {
  /**
   * @swagger
   *
   * /device/slack-notifications/{deviceId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update device (Only Super Admin)
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: slack_notifications
   *         description: Enable or disable slack notifications
   *         in: formData
   *         required: true
   *         type: boolean
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      slack_notifications: "required",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const device_id = req.params.deviceId;

        if (!device_id) {
          return apiResponse.fail(res, "Device not found", 404);
        }

        const device = await DeviceModel.findById(device_id);
        if (!device) return apiResponse.fail(res, "Device not found", 404);

        const result = await DeviceModel.update_where(
          { slack_notifications: req.body.slack_notifications },
          { id: device_id },
        );

        return apiResponse.success(res, req, result);
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_device_children = async (req, res) => {
  /**
   * @swagger
   *
   * /device/{deviceId}/children:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get device child devices
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: If device not found, or user is not owner of provided device ID
   *       401:
   *         description: Token not provided, or token may expire or invalid token. simply user is not authorized to check this api
   *       403:
   *         description: User not allowed to check this api. user have not enough permissions
   *       500:
   *         description: Internal server error
   */
  try {
    const result = await DeviceModel.get_device_child_devices({
      user_id: req.user.id,
      device_id: req.params.deviceId,
    });

    if (result) {
      return apiResponse.success(res, req, result);
    } else {
      return apiResponse.fail(res, "Invalid device ID or device not found");
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.attach_device_child = async (req, res) => {
  /**
   * @swagger
   *
   * /device/{deviceId}/attach-child/{childDeviceId}:
   *   post:
   *     security:
   *       - auth: []
   *     description: Attach child device to device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: childDeviceId
   *         description: Child Device ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: If device not found, or user is not owner of provided device ID
   *       401:
   *         description: Token not provided, or token may expire or invalid token. simply user is not authorized to check this api
   *       403:
   *         description: User not allowed to check this api. user have not enough permissions
   *       500:
   *         description: Internal server error
   */
  try {
    const device_id = req.params.deviceId;
    const child_device_id = req.params.childDeviceId;

    const result = await DeviceModel.attach_child_device({
      device_id: device_id,
      child_device_id: child_device_id,
    });

    if (result[0]) {
      return apiResponse.success(res, req, "attached");
    } else {
      return apiResponse.fail(res, "Invalid device IDs", 400);
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.detach_device_child = async (req, res) => {
  /**
   * @swagger
   *
   * /device/{deviceId}/detach-child/{childDeviceId}:
   *   put:
   *     security:
   *       - auth: []
   *     description: Detach child device from Parent device
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: number
   *       - name: childDeviceId
   *         description: Child Device ID
   *         in: path
   *         required: true
   *         type: number
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: If device not found, or user is not owner of provided device ID
   *       401:
   *         description: Token not provided, or token may expire or invalid token. simply user is not authorized to check this api
   *       403:
   *         description: User not allowed to check this api. user have not enough permissions
   *       500:
   *         description: Internal server error
   */
  try {
    const device_id = req.params.deviceId;
    const child_device_id = req.params.childDeviceId;

    const result = await DeviceModel.detach_child_device({
      device_id: device_id,
      child_device_id: child_device_id,
    });

    if (result[0]) {
      return apiResponse.success(res, req, "detached");
    } else {
      return apiResponse.fail(
        res,
        "Invalid device IDs or may already detached",
        400,
      );
    }
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
exports.getByType = async (req, res) => {
  /**
   * @swagger
   *
   * /device/type/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device by id
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Device Type id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const deviceType = req.params.id;
    const allDevices = await DeviceModel.findByType(deviceType, req.user.orgId);
    return apiResponse.success(res, req, allDevices);
  } catch (error) {
    apiResponse.fail(res, error.message, 500);
  }
};

exports.getDeviceConfig = async (req, res) => {
  /**
   * @swagger
   *
   * /device/config/{id}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get device config by device id
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: id
   *         description: Device id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const body = { deviceId: req.params.id };
    const validation = new Validator(body, { deviceId: "required" });
    if (validation.fails()) throw { ...validation.errors, status: 400 };

    const device = await DeviceModel.findById(body.deviceId);
    if (!device)
      throw { message: "No device found against provided ID", status: 404 };
    let result = null;
    if (!req.user.admin)
      result = await OrganizationDeviceModel.get_org_device(
        req.user.orgId,
        device.id,
      );
    if (!(result || req.user.admin))
      throw {
        message: "This device does not belong to provided user",
        status: 403,
      };

    const deviceSettings =
      await OrganizationDeviceSettingsModel.get_device_settings(device.id);
    const config = helper.flattenObject(deviceSettings.currentConfig);
    const filteredConfig = {};
    const editableConfigVariables = settings.get("device_config");
    if (!editableConfigVariables)
      throw {
        message: "No editable configurations found for device",
        status: 404,
      };
    editableConfigVariables.forEach((variable) => {
      const key = variable.key;
      filteredConfig[key] = config[key] !== undefined ? config[key] : null;
    });
    apiResponse.success(res, req, filteredConfig);
  } catch (err) {
    apiResponse.fail(
      res,
      err?.message?.message || err?.message || err,
      err.status || 500,
    );
  }
};

exports.setDeviceConfig = async (req, res) => {
  /**
   * @swagger
   *
   * /device/config/{id}:
   *   put:
   *     security:
   *      - auth: []
   *     description: Set or update the device configurations.
   *     tags: [Device]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: config
   *         description: Device configurations in JSON String e.g. {"example":"tempdata"}
   *         in: formData
   *         required: true
   *         type: string
   *       - name: id
   *         description: device id
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    Validator.register(
      "json",
      (value) => {
        try {
          JSON.parse(value);
        } catch (e) {
          return false;
        }
        return true;
      },
      "The :attribute must be JSON string",
    );
    const body = {
      config: req.body.config,
      deviceId: req.params.id,
    };
    const validation = new Validator(body, {
      config: "required|json",
      deviceId: "required",
    });
    if (validation.fails()) throw { ...validation.errors, status: 400 };

    const device = await DeviceModel.findById(body.deviceId, req.user.orgId);
    if (!device)
      throw { message: "No device found with provided id", status: 404 };

    const updationResult =
      await OrganizationDeviceSettingsModel.updateDeviceConfig(
        { updatedConfig: body.config },
        device.id,
      );
    helper.mqtt_publish_message(
      `d/${device.id}/config/updated`,
      JSON.parse(body.config),
      true,
      2,
    );
    apiResponse.success(res, req, updationResult);
  } catch (err) {
    apiResponse.fail(
      res,
      err?.message?.message || err?.message || err,
      err.status || 500,
    );
  }
};

exports.updateCurrentConfig = async (deviceId, currentConfig) => {
  try {
    logger.info(
      `Received request to update current configuration of device with id = ${deviceId}`,
    );
    const device = await DeviceModel.findById(deviceId);
    if (!device)
      throw { message: "No device found with provided id", status: 404 };
    let flag = true;
    let sendToAdmin = true;
    const settings2 = await OrganizationDeviceSettingsModel.get_device_settings(
      deviceId,
    );
    const configFromMQTT = helper.flattenObject(currentConfig);
    const currentDeviceConfigBeforeUpdate = helper.flattenObject(
      settings2.currentConfig,
    );
    if (objectsEqual(currentDeviceConfigBeforeUpdate, configFromMQTT)) {
      sendToAdmin = false;
    }
    if (sendToAdmin) {
      await OrganizationDeviceSettingsModel.updateDeviceConfig(
        { currentConfig },
        device.id,
      );
    }

    const settings = await OrganizationDeviceSettingsModel.get_device_settings(
      deviceId,
    );

    const currentDeviceConfig = helper.flattenObject(settings.currentConfig);
    const updatedDeviceConfig = helper.flattenObject(settings.updatedConfig);
    Object.keys(updatedDeviceConfig).forEach((key) => {
      logger.info(
        `${currentDeviceConfig[key]}, ${updatedDeviceConfig[key]}, ${key}`,
      );
      if (currentDeviceConfig[key] !== updatedDeviceConfig[key]) flag = false;
    });

    if (flag) {
      if (sendToAdmin) {
        notification.sendToSuperAdmin({
          device_id: deviceId,
          notice:
            "Configurations of {device_name} has been updated successfully.",
        });
      }
      if (!sendToAdmin) {
        return {
          message: "Notification not send",
        };
      } else {
        return true;
      }
    } else {
      if (sendToAdmin) {
        notification.sendToSuperAdmin({
          device_id: deviceId,
          notice:
            "Configurations of {device_name} are not updated. Please try again.",
        });
      }

      return false;
    }
  } catch (err) {
    logger.error(
      `Error occurred while updating current configuration of device with id = ${deviceId} ${err}`,
    );
  }
};
exports.link_device_to_course = async (req, res) => {
  /**
   * @swagger
   *
   * /device/{deviceId}/courses/{courseId}/link:
   *   put:
   *     security:
   *       - auth: []
   *     description: link device to course.
   *     tags: [Device]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: courseId
   *         description: course ID to be linked to
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = req.user?.role?.super || req.user?.role?.admin;
    const courseId = Number(req.params.courseId);
    const deviceId = Number(req.params.deviceId);
    if (!deviceId || !courseId) {
      return apiResponse.fail(
        res,
        "deviceId and courseId must be a valid number",
      );
    }

    const response = await DeviceModel.link_to_golf_course(deviceId, courseId);
    const isSameOrganizationResource = loggedInUserOrg == response.owner_id;
    if (!isSuperOrAdmin && !isSameOrganizationResource)
      return apiResponse.fail(res, "", 403);
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
