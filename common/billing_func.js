const moment = require("moment");

const helper = require("../common/helper");
const settings = require("../config/settings");
const email = require("../common/email");
const notification = require("./notification");
const config = require("../config/config");

const UserDeviceInstallmentsModel = require("../services/user_device_installments");
const InvoicesModel = require("../services/invoices");
const InvoiceItemsModel = require("../services/invoice_items");
const DeviceModel = require("../services/device");
const UserDeviceModel = require("../services/user_device");
const UserDevicePaymentsModel = require("../services/user_device_payments");
const PaymentsModel = require("../services/payments");

const { logger } = require("../logger");

module.exports.moment_format = function (date, format = "YYYY MM DD HH:mm:ss") {
  return moment(date).format(format);
};

module.exports.get_date_attr = function (date, attr) {
  const moment_date = moment(date);
  const data = {
    y: moment_date.get("year"),
    d: moment_date.get("date"),
    m: moment_date.get("month") + 1,
    h: moment_date.get("hour"),
    min: moment_date.get("minute"),
    s: moment_date.get("second"),
    ms: moment_date.get("millisecond"),
  };

  const return_data = {};
  attr.forEach(function (attribute) {
    return_data[attribute] = data[attribute];
  });
  return return_data;
};

module.exports.is_invoice_day = function (reg_date) {
  const now = moment();
  let result = false;

  if (
    !moment(this.moment_format(reg_date, "YYYY-MM-DD")).isSame(
      this.moment_format(now, "YYYY-MM-DD"),
    ) &&
    this.get_date_attr(now, ["d"]).d == this.get_date_attr(reg_date, ["d"]).d
  ) {
    result = true;
  }

  return result;
};

module.exports.get_next_bill_date = function (date = moment()) {
  return this.moment_format(
    moment(date).add(1, "M").startOf("month"),
    "YYYY-MM-DD",
  );
};

module.exports.get_billing_attr_on_owner_reg = async function (params) {
  const trial_period_allowed = settings.get("device_trial_period");
  const grace_period_allowed = settings.get("device_grace_period");

  let bill_convered_days = 0; // settings.get("bill_duration");

  const now = moment();
  let estimated_expiry_date = null;
  // let remaining_est_period_days = 0

  const trial_ended = params.trial_ended;
  let next_bill_date = now;
  const trial_period =
    params.trial_period || params.trial_period == 0
      ? params.trial_period
      : settings.get("default_trial_period");
  const grace_period =
    params.grace_period || params.grace_period == 0
      ? params.grace_period
      : settings.get("default_grace_period");

  if (trial_period_allowed && !trial_ended) {
    next_bill_date = now.add(trial_period, "days");
  }

  if (grace_period_allowed) {
    bill_convered_days += grace_period;
  }

  next_bill_date = moment(next_bill_date).add(1, "M").startOf("month");
  estimated_expiry_date = moment(next_bill_date)
    .add(bill_convered_days, "days")
    .endOf("day");
  // remaining_est_period_days = estimated_expiry_date.diff(now, 'days')

  return {
    next_bill_date: next_bill_date,
    billexpiry: estimated_expiry_date,
  };
};

module.exports.get_expiry_and_trial = async function (params) {
  const trial_period_allowed = settings.get("device_trial_period");
  const grace_period_allowed = settings.get("device_grace_period");

  let bill_convered_days = 0; // settings.get("bill_duration");

  const now = moment();
  let estimated_expiry_date = null;
  let remaining_est_period_days = 0;

  let trial_end_date = null;
  let remaining_trial_period_days = 0;

  const trial_ended = params.trial_ended;
  const reg_date = params.reg_date;
  const next_bill_date = params.next_bill_date;
  const trial_period =
    params.trial_period || params.trial_period == 0
      ? params.trial_period
      : settings.get("default_trial_period");
  const grace_period =
    params.grace_period || params.grace_period == 0
      ? params.grace_period
      : settings.get("default_grace_period");

  if (trial_period_allowed && !trial_ended) {
    trial_end_date = moment(reg_date).add(trial_period, "days").endOf("day");
    remaining_trial_period_days = trial_end_date.diff(now, "days");
    // bill_convered_days += trial_period;
  }

  if (grace_period_allowed) {
    bill_convered_days += grace_period;
  }

  estimated_expiry_date = moment(next_bill_date)
    .add(bill_convered_days, "days")
    .endOf("day");
  remaining_est_period_days = estimated_expiry_date.diff(now, "days");

  return {
    estimated_expiry_date: estimated_expiry_date,
    remaining_est_period_days: remaining_est_period_days,

    trial_end_date: trial_end_date,
    remaining_trial_period_days: remaining_trial_period_days,
  };
};

module.exports.send_notifications = function (params) {
  const allowed_enviroment = "production";
  const user = params.user;
  const notice = params.notice;
  const send_sms = !(params.send_sms && params.send_sms == false);
  const send_email = !(params.send_email && params.send_email == false);
  const send_desktop_push = !(
    params.send_desktop_push && params.send_desktop_push == false
  );
  if (send_sms && config.env === allowed_enviroment) {
    // sendind sms to user
    helper.send_sms(
      user.phone,
      `Hello ${user.name},\n\n${notice}.\n\nRegards\n${config.app.title}`,
    );
  }

  if (send_email && config.env === allowed_enviroment) {
    // sending email to user
    const email_data = {
      to: user.email,
      body: `${notice}`,
      subject: `${config.app.title} - Device Billing Expire Alert`,
    };
    if (params.email_attachment) {
      email_data.attachment = params.email_attachment;
    }
    email.default(email_data);
  }

  if (send_desktop_push && config.env === allowed_enviroment) {
    // sending push notification and mqtt notification
    notification.send({ notice: notice, users: [user] });
  }
};

module.exports.generate_individual_invoice = async function (device) {
  return new Promise(async (resolve, reject) => {
    try {
      const self = this;

      let generate_invoice_flag = false;
      let installments_info = null;
      // var grace_period = device.grace_period;
      // var products = [];
      let grand_total = 0;
      // checking subscription apply or not
      if (device.subscription) {
        const price = device.subscription_price;
        // products.push({
        //     title:device.Device_Type.title,
        //     type: 'Monthly Bill',
        //     total: price,
        //     payment: price
        // });
        grand_total += price;
        generate_invoice_flag = true;
      }

      // checking subscription apply or not end

      // checking installments pending or not
      if (device.installments) {
        installments_info = await self.get_user_device_installment_ammount({
          user_id: device.user_id,
          device_id: device.device_id,
          installment_total_price: device.installment_total_price,
          installment_per_month_price: device.installment_per_month_price,
        });
        if (installments_info.installment_needed) {
          const price = installments_info.installment_amount;
          // products.push({
          //     title:device.Device_Type.title,
          //     type: 'Installment',
          //     total: price,
          //     payment: price
          // });
          grand_total += price;
          generate_invoice_flag = true;
        }
      }
      // checking installments pending or not end

      if (generate_invoice_flag) {
        // Generation Invoice
        const invoice = await InvoiceItemsModel.create_with_invoice({
          device_id: device.device_id,
          user_id: device.user_id,
          issue_date: self.moment_format(moment(), "YYYY-MM-DD"),
          due_date: self.moment_format(
            moment().add(device.grace_period, "days"),
            "YYYY-MM-DD",
          ),
          bill_amount: device.subscription ? device.subscription_price : null,
          installment_amount:
            installments_info && installments_info.installment_needed
              ? installments_info.installment_amount
              : null,
          total_amount: grand_total,
        });
        if (invoice) {
          await DeviceModel.update(device.device_id, { enable_bill: true });
          // logger.error("Error: Bill cleared false query error");

          // setting up invoice data for PDF
          // var invoice_data = {
          //     company_details: {
          //         name: process.env.APP_TITLE,
          //         address: 'G-11 Markaz, Islamabad, Pakistan',
          //         phone: '0333-5599955',
          //         email: 'team@cowlar.com'
          //     },
          //     user_details: {
          //         name: device.Owner.name,
          //         phone: device.Owner.phone,
          //         email: device.Owner.email
          //     },
          //     invoice: {
          //         number: invoice.id,
          //         issue_date: self.moment_format(device.next_bill_date, 'ddd DD MMM, YYYY'),
          //         due_date: self.moment_format(moment(device.next_bill_date).add(grace_period, 'days'), 'ddd DD MMM, YYYY'),
          //     },
          //     products: products,
          //     prices: {
          //         grand_total: grand_total
          //     }
          // };

          // getting html to generate PDF
          // var html = helper.ejs_file_content('./views/pdfs/invoice.html', invoice_data);
          // var pdf_file_name = `./public/pdf/invoices/${device.user_id}-${device.id}-${device.next_bill_date}-invoice.pdf`;

          // // Generating PDF
          // var pdf_ok = await helper.generate_pdf(html, pdf_file_name);
          // if(pdf_ok.filename){
          //     if(process.env.ENVIROMENT == "prod"){
          //         var file = helper.get_file_content_without_options(pdf_file_name);
          //         email.default({
          //             to: device.Owner.email,
          //             body: `attachement`,
          //             subject: `${process.env.APP_TITLE} - Device Billing Expire Alert`,
          //             attachment: {data: file, filename: `invoice-${device.next_bill_date}.pdf`}
          //         });
          //     }
          //     resolve(invoice);
          // } else {
          //     resolve('Invoice created but PDF not generated and email not send.');
          // }
          resolve(invoice);
          // setting up invoice data for PDF end
        } else {
          // logger.info(err)
          logger.error("Error: invoice generation");
          // reject({ message: err.message })
          reject({ message: "Error in invoice generation" });
        }
      } else {
        logger.info("No need to generate invoice");
        resolve("No need to generate invoice");
      }
    } catch (err) {
      reject({ message: err.message });
    }
  });
};

module.exports.get_user_device_installment_ammount = function (params) {
  return new Promise((resolve, reject) => {
    UserDeviceInstallmentsModel.get_user_device_installments(
      params.user_id,
      params.device_id,
    )
      .then((installments_record) => {
        // let pending_installments = 0
        let total_paid_installments = 0;
        let new_installment_amount = 0;
        installments_record.forEach((installment) => {
          if (installment.status == 1) {
            total_paid_installments += installment.payment_amount;
          } else {
            // pending_installments += installment.payment_amount
          }
        });

        if (total_paid_installments >= params.installment_total_price) {
          // Installments End
        } else {
          const remaining_ins =
            params.installment_total_price - total_paid_installments;
          new_installment_amount =
            remaining_ins < params.installment_per_month_price
              ? remaining_ins
              : params.installment_per_month_price;
        }
        resolve({
          installment_needed: new_installment_amount > 0,
          installment_amount: new_installment_amount,
        });
      })
      .catch((err) => {
        logger.error(err);
        reject({ err: err });
      });
  });
};

module.exports.create_first_billing_invoice = async function (device) {
  const self = this;

  let generate_invoice_flag = false;
  let installments_info = null;
  let bill_amount = null;
  let installment_amount = null;
  let grand_total = 0;
  // checking subscription apply or not
  if (device.subscription) {
    const reg_date = moment(device.reg_date);
    const next_bill_date = moment(device.next_bill_date);
    const bill_days =
      parseInt(next_bill_date.diff(reg_date, "days")) - device.trial_period;

    bill_amount = (device.subscription_price / 30) * bill_days;
    grand_total += bill_amount;
    generate_invoice_flag = true;
  }
  // checking subscription apply or not end

  // checking installments pending or not
  if (device.installments) {
    installments_info = await self.get_user_device_installment_ammount({
      user_id: device.user_id,
      device_id: device.device_id,
      installment_total_price: device.installment_total_price,
      installment_per_month_price: device.installment_per_month_price,
    });
    if (installments_info.installment_needed) {
      installment_amount = installments_info.installment_amount;
      grand_total += installment_amount;
      generate_invoice_flag = true;
    }
  }
  // checking installments pending or not end

  if (generate_invoice_flag) {
    // Generation Invoice
    InvoiceItemsModel.create_with_invoice({
      device_id: device.device_id,
      user_id: device.user_id,
      issue_date: device.next_bill_date,
      due_date: self.moment_format(
        moment(device.next_bill_date).add(device.grace_period, "days"),
        "YYYY-MM-DD",
      ),
      bill_amount: bill_amount,
      installment_amount: installment_amount,
      total_amount: grand_total,
    })
      .then(() => {})
      .catch(() => {
        logger.error("Error: invoice generation");
      });
  } else {
    logger.info("No need to generate invoice");
  }
};

module.exports.update_invoice_status_individual = async function (
  invoice_item_id,
) {
  return new Promise((resolve, reject) => {
    const self = this;
    InvoiceItemsModel.findByID_detailed(invoice_item_id)
      .then((invoice_item) => {
        UserDevicePaymentsModel.get_user_device_payment({
          user_id: invoice_item.user_id,
          device_id: invoice_item.device_id,
        })
          .then(async (user_device_payment) => {
            const total_invoice_items =
              invoice_item.Invoice.Invoice_Items.length;
            const next_bill_date = self.get_next_bill_date();

            if (total_invoice_items == 1) {
              // All OK, just neet to insert data
              await InvoicesModel.update(invoice_item.invoice_id, {
                status: 1,
              });
              await InvoiceItemsModel.update(invoice_item.id, { status: 1 });
            } else {
              // Now need to setup other invoices items with new invoice
              await InvoicesModel.update(invoice_item.invoice_id, {
                status: 2,
              });
              const new_invoice_pending = await InvoicesModel.create({
                user_id: invoice_item.Invoice.user_id,
                issue_date: invoice_item.Invoice.issue_date,
                due_date: invoice_item.Invoice.due_date,
                status: 0,
              });

              // Invoice Items
              await InvoiceItemsModel.update_where(
                { status: 2 },
                { invoice_id: invoice_item.invoice_id },
              );
              // invoice_item.Invoice.Invoice_Items.forEach(async (invoice_item_individual) => {
              for (
                let i = 0;
                i < invoice_item.Invoice.Invoice_Items.length;
                i++
              ) {
                const invoice_item_individual =
                  invoice_item.Invoice.Invoice_Items[i];
                if (invoice_item_individual.id != invoice_item_id) {
                  await InvoiceItemsModel.create({
                    device_id: invoice_item_individual.device_id,
                    user_id: invoice_item_individual.user_id,
                    issue_date: invoice_item_individual.issue_date,
                    due_date: invoice_item_individual.due_date,
                    one_time_amount: invoice_item_individual.one_time_amount,
                    bill_amount: invoice_item_individual.bill_amount,
                    installment_amount:
                      invoice_item_individual.installment_amount,
                    total_amount: invoice_item_individual.total_amount,
                    status: 0,
                    invoice_id: new_invoice_pending.id || null,
                  });
                }
              }

              const new_invoice_active =
                await InvoicesModel.create_without_existing_check({
                  user_id: invoice_item.Invoice.user_id,
                  issue_date: invoice_item.Invoice.issue_date,
                  due_date: invoice_item.Invoice.due_date,
                  status: 1,
                });

              const new_invoice_item = await InvoiceItemsModel.create({
                device_id: invoice_item.device_id,
                user_id: invoice_item.user_id,
                issue_date: invoice_item.issue_date,
                due_date: invoice_item.due_date,
                one_time_amount: invoice_item.one_time_amount,
                bill_amount: invoice_item.bill_amount,
                installment_amount: invoice_item.installment_amount,
                total_amount: invoice_item.total_amount,
                status: 1,
                invoice_id: new_invoice_active.id,
              });
              invoice_item = null;
              invoice_item = await InvoiceItemsModel.findByID_detailed(
                new_invoice_item.id,
              );
            } // END of setup other invoices items with new invoice

            // Getting next bill data
            const bill_data = await self.get_expiry_and_trial({
              reg_date: user_device_payment.reg_date,
              next_bill_date: next_bill_date,
              grace_period: user_device_payment.grace_period,
              trial_period: user_device_payment.trial_period,
              trial_ended: user_device_payment.trial_ended,
            });
            bill_data.next_bill_date = next_bill_date;

            resolve({
              invoice_item: invoice_item,
              user_device_payment: user_device_payment,
              bill_data: bill_data,
            });
          })
          .catch((err) => {
            reject({ message: err.message });
          });
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};

module.exports.create_payment_individual_device = async function (
  invoice_item,
) {
  return new Promise((resolve, reject) => {
    const data = {
      user_id: invoice_item.user_id,
      device_id: invoice_item.device_id,
      receive_date: moment(),
      status: 1,
      installment_amount: invoice_item.installment_amount,
      bill_amount: invoice_item.bill_amount,
      one_time_amount: invoice_item.one_time_amount,
      invoice_id: invoice_item.invoice_id,
    };

    PaymentsModel.create(data)
      .then((payment) => {
        if (
          invoice_item.installment_amount &&
          invoice_item.installment_amount > 0
        ) {
          UserDeviceInstallmentsModel.create({
            user_id: invoice_item.user_id,
            device_id: invoice_item.device_id,
            payment_date: moment(),
            payment_amount: invoice_item.installment_amount,
          })
            .then((installment) => {})
            .catch(() => {});
        }
        resolve(payment);
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};

module.exports.generate_invoice_pdf = async function (invoice) {
  return new Promise(async (resolve, reject) => {
    try {
      const self = this;
      const products = [];
      let grand_total = 0;
      for (let i = 0; i < invoice.Invoice_Items.length; i++) {
        const user_device = await UserDeviceModel.get_user_device_for_invoice(
          invoice.User.id,
          invoice.Invoice_Items[i].device_id,
        );
        let device_name = invoice.Invoice_Items[i].id;
        if (user_device.Device && user_device.Device.serial) {
          device_name = user_device.device_name || user_device.Device.serial;
        }
        grand_total += invoice.Invoice_Items[i].total_amount;
        products.push({
          title: device_name,
          product: user_device.Device.Device_Type.title,
          bill: invoice.Invoice_Items[i].bill_amount
            ? invoice.Invoice_Items[i].bill_amount + " PKR"
            : "-",
          installment: invoice.Invoice_Items[i].installment_amount
            ? invoice.Invoice_Items[i].installment_amount + " PKR"
            : "-",
          total: invoice.Invoice_Items[i].total_amount
            ? invoice.Invoice_Items[i].total_amount + " PKR"
            : "0",
        });
      }

      // setting up invoice data for PDF
      const path = require("path");
      const logo = path.join(
        "file://",
        `${app_root_path}/public/images/logos/${app_config.logo}.png`,
      );

      const settings = require("../config/settings");
      const invoice_data = {
        logo: logo,
        company_details: {
          name: settings.get("company_name"),
          address: settings.get("company_address"),
          phone: settings.get("company_phone"),
          email: settings.get("company_email"),
          website: settings.get("company_website"),
        },
        user_details: {
          name: invoice.User.name,
          phone: invoice.User.phone,
          email: invoice.User.email,
        },
        invoice: {
          number: invoice.id,
          issue_date: self.moment_format(
            invoice.next_bill_date,
            "ddd DD MMM, YYYY",
          ),
          due_date: self.moment_format(invoice.due_date, "ddd DD MMM, YYYY"),
        },
        products: products,
        prices: {
          grand_total: grand_total,
        },
      };

      // getting html to generate PDF
      const html = helper.ejs_file_content(
        "./views/pdfs/invoice-all-devices.html",
        invoice_data,
      );
      const pdf_file_name = `./public/pdf/invoices/invoice-${invoice.id}${invoice.User.id}-${invoice.issue_date}.pdf`;

      // Generating PDF
      const pdf_ok = await helper.generate_pdf(html, pdf_file_name);
      if (pdf_ok.filename) {
        resolve(pdf_file_name);
      } else {
        reject({ message: "Invoice PDF not generated." });
      }
    } catch (err) {
      reject({ message: err.message });
    }
  });
};

module.exports.update_invoice_status_multiple = async function (data) {
  return new Promise(async (resolve, reject) => {
    data.invoice_item_ids = data.invoice_item_ids.split(",");
    data.not_selected_items = data.not_selected_items
      ? data.not_selected_items.split(",")
      : [];
    const device_ids = [];

    InvoicesModel.get_invoice_with_items(data.invoice_id)
      .then(async (invoice) => {
        // let invoice_id = invoice.id
        if (data.invoice_item_ids.length == invoice.Invoice_Items.length) {
          // simple case, just update invoice and invoice items status to 1
          await InvoicesModel.update(data.invoice_id, { status: 1 });
          await InvoiceItemsModel.update_where(
            { status: 1 },
            { invoice_id: data.invoice_id },
          );
          for (let i = 0; i < invoice.Invoice_Items.length; i++) {
            if (
              data.invoice_item_ids.indexOf(
                invoice.Invoice_Items[i].id.toString(),
              ) > -1
            ) {
              device_ids.push(invoice.Invoice_Items[i].device_id);
            }
          }
        } else {
          // complex case
          const new_invoice_active =
            await InvoicesModel.create_without_existing_check({
              user_id: invoice.user_id,
              issue_date: invoice.issue_date,
              due_date: invoice.due_date,
              status: 1,
            });
          await InvoicesModel.update(invoice.id, { status: 2 });
          const new_invoice_pending =
            await InvoicesModel.create_without_existing_check({
              user_id: invoice.user_id,
              issue_date: invoice.issue_date,
              due_date: invoice.due_date,
              status: 0,
            });
          // invoice_id = new_invoice_active.id
          // Invoice Items
          await InvoiceItemsModel.update_where(
            { status: 2 },
            { invoice_id: invoice.id },
          );
          for (let i = 0; i < invoice.Invoice_Items.length; i++) {
            const invoice_item_individual = invoice.Invoice_Items[i];
            let status = 0;
            let invoice_id_for_item = new_invoice_pending.id || null;

            if (
              data.invoice_item_ids.indexOf(
                invoice_item_individual.id.toString(),
              ) > -1
            ) {
              device_ids.push(invoice_item_individual.device_id);
              status = 1;
              invoice_id_for_item = new_invoice_active.id || null;
            }
            await InvoiceItemsModel.create({
              device_id: invoice_item_individual.device_id,
              user_id: invoice_item_individual.user_id,
              issue_date: invoice_item_individual.issue_date,
              due_date: invoice_item_individual.due_date,
              one_time_amount: invoice_item_individual.one_time_amount,
              bill_amount: invoice_item_individual.bill_amount,
              installment_amount: invoice_item_individual.installment_amount,
              total_amount: invoice_item_individual.total_amount,
              status: status,
              invoice_id: invoice_id_for_item || null,
            });
          }
          invoice = await InvoicesModel.get_invoice_with_items(
            new_invoice_active.id,
          );
        }

        resolve({
          invoice: invoice,
          devices: device_ids,
        });
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};

module.exports.create_payment_for_invoice = async function (invoice) {
  return new Promise(async (resolve, reject) => {
    let invoice_total = 0;
    let one_time_amount = 0;
    let bill_amount = 0;
    let installment_amount = 0;

    for (let i = 0; i < invoice.Invoice_Items.length; i++) {
      if (
        invoice.Invoice_Items[i].installment_amount &&
        invoice.Invoice_Items[i].installment_amount > 0
      ) {
        await UserDeviceInstallmentsModel.create({
          user_id: invoice.Invoice_Items[i].user_id,
          device_id: invoice.Invoice_Items[i].device_id,
          payment_date: moment(),
          payment_amount: invoice.Invoice_Items[i].installment_amount,
        });
        installment_amount += invoice.Invoice_Items[i].installment_amount;
      }

      if (
        invoice.Invoice_Items[i].one_time_amount &&
        invoice.Invoice_Items[i].one_time_amount > 0
      ) {
        one_time_amount += invoice.Invoice_Items[i].one_time_amount;
      }

      if (
        invoice.Invoice_Items[i].bill_amount &&
        invoice.Invoice_Items[i].bill_amount > 0
      ) {
        bill_amount += invoice.Invoice_Items[i].bill_amount;
      }

      invoice_total += invoice.Invoice_Items[i].total_amount;
    }

    const data = {
      user_id: invoice.user_id,
      device_id: 0,
      receive_date: moment(),
      status: 1,

      installment_amount: installment_amount,
      bill_amount: bill_amount,
      one_time_amount: one_time_amount,

      invoice_id: invoice.id,
      invoice_total: invoice_total,
    };

    PaymentsModel.create(data)
      .then((payment) => {
        resolve(payment);
      })
      .catch((err) => {
        reject({ message: err.message });
      });
  });
};
