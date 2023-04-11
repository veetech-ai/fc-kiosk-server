const DeviceModel = require("../services/device");
const UserDevicePaymentsModel = require("../services/user_device_payments");
const DeviceAdminConfigModel = require("../services/device_admin_configuration");
const InvoicesModel = require("../services/invoices");
const InvoiceItemsModel = require("../services/invoice_items");

const apiResponse = require("../common/api.response");
const Validator = require("validatorjs");
const helper = require("../common/helper");
const billing_func = require("../common/billing_func");
const moment = require("moment");

const { logger } = require("../logger");

/**
 * @swagger
 * tags:
 *   name: Billing
 *   description: Device Bill management
 */

exports.check_device_billing = async () => {
  try {
    const now = moment();
    const devices = await UserDevicePaymentsModel.billing_devices();

    for (let i = 0; i < devices.length; i++) {
      const device = devices[i];

      device.Owner.id = device.user_id;
      const device_name = device.device_id;

      // checking if next_bill_date is valid or not
      if (device.next_bill_date) {
        // checking invoice date is come or not
        if (
          moment(
            billing_func.moment_format(device.next_bill_date, "YYYY-MM-DD"),
          ).isSame(billing_func.moment_format(now, "YYYY-MM-DD"))
        ) {
          // finding that, if invoice for this month is already generated or not
          const invoice = await InvoiceItemsModel.findByWhere({
            device_id: device.device_id,
            user_id: device.user_id,
            issue_date: billing_func.moment_format(
              device.next_bill_date,
              "YYYY-MM-DD",
            ),
          });
          if (invoice) {
            logger.info("already generated. No need to generate invoice");
            // send email, notifications and enable bill flag
          } else await billing_func.generate_individual_invoice(device);
        } else logger.info("no need to generate invoice");
      } else logger.error("Error: next_bill_date is invalid or null");

      const bill_data = await billing_func.get_expiry_and_trial({
        reg_date: device.reg_date,
        next_bill_date: device.next_bill_date,
        grace_period: device.grace_period,
        trial_period: device.trial_period,
        trial_ended: device.trial_ended,
      });

      const remaining_est_period_days = bill_data.remaining_est_period_days;
      const remaining_trial_period_days = bill_data.remaining_trial_period_days;

      if (remaining_trial_period_days <= 0) {
        if (
          !device.trial_ended &&
          remaining_trial_period_days == 0 &&
          remaining_est_period_days > 0
        ) {
          // Trial period expired
          billing_func.send_notifications({
            send_sms: false,
            send_email: false,
            user: device.Owner,
            notice: `Your Trial period for '${device_name}' device is expired. Now your billing period is started`,
          });
        }

        await UserDevicePaymentsModel.update({
          user_id: device.user_id,
          device_id: device.device_id,
          trial_ended: true,
        });
      }

      if (remaining_est_period_days <= 0) {
        logger.info(`Device '${device.device_id}' Bill Expire`);

        // setting device bill cleared column in db
        await DeviceModel.update(device.device_id, { bill_cleared: false });

        // MQTT started
        if (mqtt_connection_ok) {
          let device_config = {};

          const device_admin_config =
            await DeviceAdminConfigModel.get_device_admin_configuration(
              device.device_id,
            );
          if (device_admin_config && device_admin_config.config) {
            device_config = device_admin_config.config;
          }

          device_config.bill = true;
          device_config.billpaid = moment(device.next_bill_date)
            .utc()
            .format("x");
          device_config.billgp = device.grace_period;
          helper.mqtt_publish_message(
            `d/${device.id}/config/admin`,
            device_config,
          );
        }
        // MQTT ends

        // sending notification
        if (remaining_est_period_days == 0) {
          // var notice = `Your device "${device_name}" is expired. Pay your bill to re-activate it.`;
          // billing_func.send_notifications({
          //   user: device.Owner,
          //   notice: notice,
          // });
        }
      } else {
        // Bill will expire soon case
        // Sending Notifications
        if ([1].indexOf(remaining_est_period_days) > -1) {
          // let notice = `Your device "${device_name}" will be expire after ${remaining_est_period_days} day(s). Please pay your bill before ${moment(
          //   estimated_expiry_date,
          // ).format("dddd DD MMMM, YYYY")}`;
          // billing_func.send_notifications({
          //   send_sms: false,
          //   user: device.Owner,
          //   notice: notice,
          // });
        }
        // Sending Notifications end
      }
    }
  } catch (err) {
    logger.error(err);
  }
};

exports.send_billing_notifications = async () => {
  try {
    const now = moment();

    const invoices = await InvoicesModel.cron_notification_list();

    for (let i = 0; i < invoices.length; i++) {
      const invoice = invoices[i];
      let notice = null;

      if (
        moment(
          billing_func.moment_format(invoice.issue_date, "YYYY-MM-DD"),
        ).isSame(billing_func.moment_format(now, "YYYY-MM-DD")) &&
        !invoice.issue_notice
      ) {
        notice = "Your invoice is issued. Please pay your bill.";
      }
      if (
        moment(
          billing_func.moment_format(invoice.due_date, "YYYY-MM-DD"),
        ).isSame(billing_func.moment_format(now, "YYYY-MM-DD")) &&
        !invoice.expire_notice
      ) {
        notice =
          "Your invoice due date is expiring. Please pay your bill to keep unlock your devices.";
      }

      if (!notice) continue;

      // Generate PDF for Invoice
      const pdf = await billing_func.generate_invoice_pdf(invoice);

      const pdf_file = helper.get_file_content_without_options(pdf);
      billing_func.send_notifications({
        user: invoice.User,
        notice: notice,
        email_attachment: {
          data: pdf_file,
          filename: `invoice-${invoice.issue_date}.pdf`,
        },
      });
    }
  } catch (err) {
    logger.error(err);
  }
};

exports.get_all_pending = async (req, res) => {
  /**
   * @swagger
   *
   * /bill/all/pending:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get user device pending bills
   *     tags: [Billing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const user_id = req.user.id;

    const result = await DeviceModel.pending_bills(user_id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all_user_invoices = async (req, res) => {
  /**
   * @swagger
   *
   * /bill/user/invoices:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get user invoices
   *     tags: [Billing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const user_id = req.user.id;

    const result = await InvoicesModel.get_all_user_invoices_without_items(
      user_id,
    );

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.get_all_user_invoice_items = async (req, res) => {
  /**
   * @swagger
   *
   * /bill/user/invoice/{invoiceId}/items:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get user invoice details/items
   *     tags: [Billing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: invoiceId
   *         description: Invoice ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const invoice_id = req.params.invoiceId;

    const result = await InvoicesModel.get_invoice_with_items(invoice_id);

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.user_device_bill_invoice_item = async (req, res) => {
  /**
   * @swagger
   *
   * /bill/invoice-item/user/{userId}/device/{deviceId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get user device latest invoice. For super admin only
   *     tags: [Billing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: userId
   *         description: User ID
   *         in: path
   *         required: true
   *         type: string
   *       - name: deviceId
   *         description: Device ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */

  /**
   * @swagger
   *
   * /bill/invoice-item/user/device/{deviceId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get user device latest invoice
   *     tags: [Billing]
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
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const user_id = req.params.userId ? req.params.userId : req.user.id;
    const device_id = req.params.deviceId;

    const result = await InvoiceItemsModel.get_last_user_device_invoice_item({
      user_id: user_id,
      device_id: device_id,
    });

    return apiResponse.success(res, req, result);
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.pay_bill_individual = async (req, res) => {
  /**
   * @swagger
   *
   * /bill/pay/individual:
   *   post:
   *     security:
   *      - auth: []
   *     description: Pay individual device bill
   *     tags: [Billing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: invoice_item_id
   *         description: Invoice Item ID
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      invoice_item_id: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    /**
     * NOTE
     * Payments methods integrations are pending for now
     */

    validation.passes(async function () {
      try {
        // update invoice statuses
        const invoice_update_return =
          await billing_func.update_invoice_status_individual(
            req.body.invoice_item_id,
          );

        // set payment and installment
        await billing_func.create_payment_individual_device(
          invoice_update_return.invoice_item,
        );

        // update device cols for billing
        await DeviceModel.update(invoice_update_return.invoice_item.device_id, {
          enable_bill: 0,
          bill_cleared: 1,
        });

        // update next bill date and expiry date in user_device_payments table
        await UserDevicePaymentsModel.update({
          user_id: invoice_update_return.invoice_item.user_id,
          device_id: invoice_update_return.invoice_item.device_id,
          billexpiry: invoice_update_return.bill_data.estimated_expiry_date,
          billpaid: moment(),
          next_bill_date: invoice_update_return.bill_data.next_bill_date,
        });

        return apiResponse.success(res, req, "Bill Paid");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};

exports.pay_bill_multiple = async (req, res) => {
  /**
   * @swagger
   *
   * /bill/pay/multiple:
   *   post:
   *     security:
   *      - auth: []
   *     description: Pay multiple device bill at once
   *     tags: [Billing]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: invoice_id
   *         description: Invoice ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: invoice_item_ids
   *         description: Comma separated invoice Item ID
   *         in: formData
   *         required: true
   *         type: string
   *       - name: not_selected_items
   *         description: Comma separated invoice Item ID which are not selected for payment. In short, remaining invoice items
   *         in: formData
   *         required: true
   *         type: string
   *       - name: total_amount
   *         description: Total payment amount
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      invoice_id: "required",
      invoice_item_ids: "required",
      total_amount: "required",
    });

    validation.fails(function () {
      apiResponse.fail(res, validation.errors);
    });

    /**
     * NOTE
     * Payments methods integrations are pending for now
     */

    validation.passes(async function () {
      try {
        // update invoice statuses
        const invoice_update_return =
          await billing_func.update_invoice_status_multiple(req.body);

        // set payment and installment
        await billing_func.create_payment_for_invoice(
          invoice_update_return.invoice,
        );

        // update device cols for billing
        await DeviceModel.update_where(
          { enable_bill: 0, bill_cleared: 1 },
          { id: invoice_update_return.devices },
        );

        const user_payment_data = await UserDevicePaymentsModel.findByWhere({
          user_id: req.user.id,
          device_id: invoice_update_return.devices,
        });

        for (let i = 0; i < user_payment_data.length; i++) {
          const bill_data = await billing_func.get_expiry_and_trial({
            reg_date: user_payment_data[i].reg_date,
            next_bill_date: user_payment_data[i].next_bill_date,
            grace_period: user_payment_data[i].grace_period,
            trial_period: user_payment_data[i].trial_period,
            trial_ended: user_payment_data[i].trial_ended,
          });

          // update next bill date and expiry date in user_device_payments table
          await UserDevicePaymentsModel.update({
            user_id: user_payment_data[i].user_id,
            device_id: user_payment_data[i].device_id,
            billexpiry: bill_data.estimated_expiry_date,
            billpaid: moment(),
            next_bill_date: billing_func.get_next_bill_date(
              user_payment_data[i].next_bill_date,
            ),
          });
        }

        return apiResponse.success(res, req, "Bill Paid");
      } catch (err) {
        return apiResponse.fail(res, err.message, 500);
      }
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, 500);
  }
};
