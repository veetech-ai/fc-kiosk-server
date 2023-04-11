// External Imports
const Validator = require("validatorjs");
const moment = require("moment");

// Common Imports
const apiResponse = require("../common/api.response");
const email = require("../common/email");
const helper = require("../common/helper");
const billing_func = require("../common/billing_func");

// Services Imports
const ConfigurationsModel = require("../services/configurations");
const DeviceModel = require("../services/device");
const UserDevicePaymentsModel = require("../services/user_device_payments");
const DeviceAdminConfigModel = require("../services/device_admin_configuration");
const smsLogsModel = require("../services/sms_logs");

// Configuration Imports
const config = require("../config/config");

// Logger Imports
const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Misc
 *   description: Misc APIs
 */

exports.contact_us = async (req, res) => {
  /**
   * @swagger
   *
   * /misc/contact:
   *   post:
   *     security: []
   *     description: Contact feedback form submit
   *     tags: [Misc]
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
   *       - name: email
   *         description: Email
   *         in: formData
   *         required: true
   *         type: string
   *       - name: phone
   *         description: Phone
   *         in: formData
   *         required: false
   *         type: string
   *       - name: message
   *         description: Email message
   *         in: formData
   *         required: true
   *         type: string
   *       - name: captchatoken
   *         description:
   *         in: header
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    await helper.send_slack(
      `${req.body.name} wants to connect.\n
       Email: ${req.body.email} \n
       Message: ${req.body.message}
      `,
      config.slack_contact_channel,
    );
    const emailResponse = await email.contact_email(req.body);
    return apiResponse.success(res, req, emailResponse);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_app_config = async (req, res) => {
  /**
   * @swagger
   *
   * /misc/app-configuration:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get app configurations
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */
  try {
    const result = await ConfigurationsModel.get();
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.set_app_config = (req, res) => {
  /**
   * @swagger
   *
   * /misc/app-configuration:
   *   post:
   *     security:
   *      - auth: []
   *     description: Set App configuration.
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: config
   *         description: Configuration settings in JSON String
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
      config: "required|json",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        req.body.orgId = req.user.orgId;
        const config = await ConfigurationsModel.get();

        const sn = config.config;

        try {
          const result = await ConfigurationsModel.save(req.body);

          const rn = JSON.parse(req.body.config);
          if (
            typeof sn.slack_notifications !== "undefined" &&
            typeof rn.slack_notifications !== "undefined" &&
            sn.slack_notifications != rn.slack_notifications
          ) {
            helper.send_slack_forcefully(
              `Slack Notifications ${rn.slack_notifications ? "ON" : "OFF"}`,
              config.slack.deviceToChannel,
            );
          }

          global_app_config = JSON.parse(req.body.config);

          return apiResponse.success(res, req, result);
        } catch (err) {
          return apiResponse.fail(res, err.message, 500);
        }
      } catch (error) {
        logger.error(error);

        try {
          const result = await ConfigurationsModel.save(req.body);

          global_app_config = JSON.parse(req.body.config);
          return apiResponse.success(res, req, result);
        } catch (err) {
          return apiResponse.fail(res, err.message, 500);
        }
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_assets = (req, res) => {
  /**
   * @swagger
   *
   * /misc/assets:
   *   get:
   *     security: []
   *     description: Get assets
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const fs = require("fs");
    const files = [];

    fs.readdirSync("./public/assets/").forEach((file) => {
      files.push(`${config.app.filesPath}assets/${file}`);
    });

    return apiResponse.success(res, req, files);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
exports.post_assets = (req, res) => {
  /**
   * @swagger
   *
   * /misc/assets:
   *   post:
   *     security: []
   *     description: Get assets
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: file
   *         description: Upload file
   *         in: formData
   *         required: true
   *         type: file
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const formidable = require("formidable");
    const upload_file = require("../common/upload");

    const form = new formidable.IncomingForm();
    form.parse(req, async function (err, fields, files) {
      try {
        if (err) {
          return apiResponse.fail(res, err.message);
        }

        const uploadedFileKey = await upload_file.upload_file(
          files.file,
          "assets",
          [],
          1,
        );

        return apiResponse.success(
          res,
          req,
          upload_file.getFileURL(uploadedFileKey),
        );
      } catch (err) {
        logger.error(err);
        apiResponse.fail(res, err.message);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.sync_user_device_payments = async (req, res) => {
  /**
   * @swagger
   *
   * /misc/sync-user-device-payments:
   *   get:
   *     security:
   *       - auth: []
   *     description: Sync device,user,products and user_device_payments
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const devices = await DeviceModel.get_owner_devices_with_product();

    const response_arr = [];
    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];

      const now = moment();
      const grace_period = device.grace_period;
      const trial_period = device.trial_period;
      const trial_ended = trial_period <= 0;
      const bill = !!(
        device.Device_Type.installments || device.Device_Type.subscription
      );

      const user_device_payments_obj = {
        user_id: device.owner_id,
        device_id: device.id,
        device_type: device.Device_Type.id,
        bill: bill,
        otp: device.Device_Type.price,
        installments: device.Device_Type.installments,
        installment_total_price: device.Device_Type.installment_total_price,
        installment_per_month_price:
          device.Device_Type.installment_per_month_price,
        subscription: device.Device_Type.subscription,
        subscription_price: device.Device_Type.subscription_price,

        billpaid: now,
        reg_date: now,
        grace_period: grace_period,
        trial_period: trial_period,
        trial_ended: trial_ended,
      };

      let device_config = {};
      const device_admin_config =
        await DeviceAdminConfigModel.get_device_admin_configuration(device.id);
      if (device_admin_config && device_admin_config.config) {
        device_config = device_admin_config.config;
      }

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

        device_config.bill = true;
        device_config.billpaid = moment(bill_data.next_bill_date)
          .utc()
          .format("x");
        device_config.billgp = grace_period;
      } else {
        device_config.bill = false;
      }

      if (mqtt_connection_ok) {
        helper.mqtt_publish_message(
          `d/${device.id}/config/admin`,
          device_config,
        );
      }

      const result = await UserDevicePaymentsModel.create_only(
        user_device_payments_obj,
      );

      if (result.id) {
        response_arr.push({
          user_id: device.owner_id,
          device_id: device.id,
          status: "Synced",
        });
      } else if (result.message == "exists") {
        response_arr.push({
          user_id: device.owner_id,
          device_id: device.id,
          status: "Already Synced",
        });
      } else {
        response_arr.push({
          user_id: device.owner_id,
          device_id: device.id,
          status: "Error",
          err: result,
        });
      }
    }

    return apiResponse.success(res, req, response_arr);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.build_cache_update = (req, res) => {
  /**
   * @swagger
   *
   * /misc/build-cache-update:
   *   get:
   *     security: []
   *     description: Cache update for frontend app
   *     tags: [Misc]
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
   *         description: Success
   */
  try {
    if (mqtt_connection_ok) {
      helper.mqtt_publish_message(
        "fe_app_cache_updated",
        { cache_updated: true },
        false,
        2,
      );
    }
    return apiResponse.success(res, req, "ok");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.getBuildVersion = (req, res) => {
  /**
   * @swagger
   *
   * /misc/get-build-version:
   *   get:
   *     security: []
   *     description: Get Backend Build Version
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    return apiResponse.success(res, req, config.apiBuild);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_sms_logs = async (req, res) => {
  /**
   * @swagger
   *
   * /misc/get-sms-logs:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get SMS Logs which are sending through our APP
   *     tags: [Misc]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: to
   *         description: to number (who received sms)
   *         in: query
   *         required: false
   *         type: string
   *       - name: from
   *         description: from number (who sends sms)
   *         in: query
   *         required: false
   *         type: false
   *       - name: accountSid
   *         description: accountSid
   *         in: query
   *         required: false
   *         type: false
   *       - name: sid
   *         description: sid
   *         in: query
   *         required: false
   *         type: false
   *       - name: body
   *         description: keyword message contains
   *         in: query
   *         required: false
   *         type: false
   *       - name: failed
   *         description: show failed logs
   *         in: query
   *         required: false
   *         type: boolean
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const result = await smsLogsModel.get(req.query);
    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.pi_client_build_update = (req, res) => {
  /**
   * @swagger
   *
   * /misc/pi-client-build-update:
   *   get:
   *     security: []
   *     description: Update PI Client Build
   *     tags: [Misc]
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
   *         description: Success
   */
  try {
    if (mqtt_connection_ok) {
      helper.mqtt_publish_message(
        "new-client-build",
        { updated_pi_build: true },
        false,
        2,
      );
    }
    return apiResponse.success(res, req, "ok");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.pi_backend_build_update = (req, res) => {
  /**
   * @swagger
   *
   * /misc/pi-backend-build-update:
   *   get:
   *     security: []
   *     description: Update PI Backend Build
   *     tags: [Misc]
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
   *         description: Success
   */
  try {
    if (mqtt_connection_ok) {
      helper.mqtt_publish_message(
        "new-backend-build",
        { updated_pi_build: true },
        false,
        2,
      );
    }
    return apiResponse.success(res, req, "ok");
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
