const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");

const helper = require("../common/helper");
const config = require("../config/config");

const { logger } = require("../logger");

let transporter = null;
let mailGun = null;
let contact_url = config.email.contactLink;
let contact_title = config.email.entityTitle;
if (config.email.useTransporter) {
  transporter = nodemailer.createTransport({
    host: config.email.transporter.host,
    port: config.email.transporter.port,
    secureConnection: true,
    tls: { ciphers: "SSLv3" },
    auth: {
      user: config.email.transporter.username,
      pass: config.email.transporter.password,
    },
  });
} else if (config.email.userMailGun) {
  mailGun = require("mailgun-js")({
    apiKey: config.email.mailGun.key,
    domain: config.email.mailGun.domain,
  });
}

exports.send_test = (options) => {
  return new Promise((resolve, reject) => {
    const to = options.to || "asfund.cowlar@gmail.com";
    const subject = options.subject || "Test Email";
    const message = options.message || "This is test email msg";

    const test_template = fs.readFileSync("./views/emails/test.html", {
      encoding: "utf-8",
    });

    const html = ejs.render(test_template, {
      hello: `${config.app.title}`,
      message: message,
    });

    this.send({
      to: to,
      subject: subject,
      message: html,
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
exports.send = (options) => {
  return new Promise((resolve, reject) => {
    if (options.to && options.subject && options.message) {
      const mailOptions = {
        from: options.from
          ? options.from
          : `${config.email.fromName} <${config.email.fromEmail}>`,
        replyTo: options.replyTo ? options.replyTo : config.email.replyTo,
        to: options.to,
        subject: options.subject,
        html: options.message,
      };
      if (config.email.userMailGun) {
        if (options.attachment)
          mailOptions.attachment = new mailGun.Attachment(options.attachment);
        mailGun.messages().send(mailOptions, function (error, body) {
          if (error) {
            reject({ message: error });
          } else {
            resolve(body);
          }
        });
      } else if (config.email.useTransporter) {
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            logger.error(error);
            reject(error);
          } else {
            resolve("Email sent: " + info.response);
          }
        });
      } else {
        resolve("No need to send email in test environment");
      }
    } else {
      reject("Email data not provided");
    }
  });
};

exports.default = (data) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync("./views/emails/default.html", {
      encoding: "utf-8",
    });
    const html = ejs.render(template, data);

    const email_params = {
      to: data.to,
      subject: data.subject || config.app.title,
      message: html,
    };
    if (data.attachment) {
      email_params.attachment = data.attachment;
    }

    this.send(email_params)
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
exports.send_registration_email = (
  user,
  token,
  email_code,
  type = false,
  password = false,
) => {
  return new Promise((resolve, reject) => {
    const test_template = fs.readFileSync("./views/emails/registration.html", {
      encoding: "utf-8",
    });

    let acctivation_url =
      config.app.frontendURL + "email-verify?token=" + token;
    if (user.order_id) {
      acctivation_url += `&order=${user.order_id}`;
    }
    const html = ejs.render(test_template, {
      user_name: user.name,
      acctivation_url: acctivation_url,
      email: user.email,
      email_code: email_code,
      type: type,
      password: password,
    });

    this.send({
      to: user.email,
      subject: "Account Activation | " + config.app.title,
      message: html,
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

exports.send_share_device_verification = (to_user, from_user, token) => {
  return new Promise((resolve, reject) => {
    const test_template = fs.readFileSync("./views/emails/share_device.html", {
      encoding: "utf-8",
    });
    const html = ejs.render(test_template, {
      user_name: to_user.name,
      acctivation_url:
        config.app.frontendURL + "shared-device-verification?token=" + token,
      email: to_user.email,
      share_by: from_user.email,
    });

    this.send({
      to: to_user.email,
      subject: "Device Share Verification | " + config.app.title,
      message: html,
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

exports.send_share_device_invitation_email = (to_user, from_user, token) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync(
      "./views/emails/share_device_invitation.html",
      {
        encoding: "utf-8",
      },
    );
    const html = ejs.render(template, {
      user_name: to_user.email,
      acctivation_url: config.app.frontendURL + "invitation?token=" + token,
      email: to_user.email,
      share_by: from_user.email,
    });

    this.send({
      to: to_user.email,
      subject: "Invitation Email | " + config.app.title,
      message: html,
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

exports.forget_password = (user, token) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync("./views/emails/forget_password.html", {
      encoding: "utf-8",
    });
    const html = ejs.render(template, {
      user_name: user.name,
      email: user.email,
      acctivation_url: config.app.frontendURL + "reset-password?token=" + token,
      icon_url: new URL("img/icons/mstile-310x150.png", config.app.frontendURL),
    });

    this.send({
      to: user.email,
      subject: "Password Recovery | " + config.app.title,
      message: html,
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

exports.wedding_event = (event_name, contact_info, users) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync("./views/emails/wedding_event.html", {
      encoding: "utf-8",
    });

    const promises = [];

    for (const user of users) {
      const html = ejs.render(template, {
        event_name: event_name,
        show_phone_number:
          contact_info.contactMedium === "" ||
          contact_info.contactMedium === null ||
          contact_info.contactMedium === undefined
            ? false
            : true,
        phone_number: contact_info.userPhone,
        email: contact_info.userEmail,
        contact_medium: contact_info.contactMedium,
        receiver_name: user.name,
        icon_url: new URL(
          "img/icons/mstile-310x150.png",
          config.app.frontendURL,
        ),
      });
      promises.push(
        this.send({
          to: user.email,
          subject: "Wedding Event Applciation",
          message: html,
        }),
      );
    }

    Promise.all(promises)
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

exports.send_tranfer_device_verification = (to_user, from_user, token) => {
  return new Promise((resolve, reject) => {
    const test_template = fs.readFileSync(
      "./views/emails/transfer_device.html",
      {
        encoding: "utf-8",
      },
    );
    const html = ejs.render(test_template, {
      user_name: to_user.name,
      acctivation_url:
        config.app.frontendURL + "transfer-device-verification?token=" + token,
      email: to_user.email,
      transfer_by: from_user.email,
      icon_url: config.app.frontendURL + "/img/icons/mstile-310x150.png",
    });

    this.send({
      to: to_user.email,
      subject: "Device Transfer Verification | " + config.app.title,
      message: html,
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

exports.send_transfer_device_invitation_email = (to_user, from_user, token) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync(
      "./views/emails/transfer_device_invitation.html",
      {
        encoding: "utf-8",
      },
    );
    const html = ejs.render(template, {
      user_name: to_user.email,
      acctivation_url:
        config.app.frontendURL + "invitation?token=" + token + "&t=transfer",
      email: to_user.email,
      transfer_by: from_user.email,
    });

    this.send({
      to: to_user.email,
      subject: "Invitation Email | " + config.app.title,
      message: html,
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

exports.contact_email = (data) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync("./views/emails/contact.html", {
      encoding: "utf-8",
    });
    const html = ejs.render(template, data);

    this.send({
      to: config.email.contactEmail,
      subject: `${config.app.title} Contact Form`,
      message: html,
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

exports.order_summary = (data) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync("./views/emails/order-summary.html", {
      encoding: "utf-8",
    });
    const html = ejs.render(template, data);

    const email_params = {
      to: data.to,
      subject: data.subject || config.app.title,
      message: html,
    };
    if (data.attachment) {
      email_params.attachment = data.attachment;
    }

    this.send(email_params)
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

exports.order_summary_for_admins = (data) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync(
      "./views/emails/order-summary-admins.html",
      {
        encoding: "utf-8",
      },
    );
    const html = ejs.render(template, data);

    const email_params = {
      to: data.to,
      subject: data.subject || config.app.title,
      message: html,
    };
    if (data.attachment) {
      email_params.attachment = data.attachment;
    }

    this.send(email_params)
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

exports.send_social_registration_email = (user, pass, type) => {
  return new Promise((resolve, reject) => {
    const test_template = fs.readFileSync(
      "./views/emails/social_registration.html",
      {
        encoding: "utf-8",
      },
    );
    const html = ejs.render(test_template, {
      user_name: user.name,
      password: pass,
      email: user.email,
      type: type,
    });

    this.send({
      to: user.email,
      subject: "Account Registration | " + config.app.title,
      message: html,
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

exports.send_place_order_emails = (order_id) => {
  const OrderModel = require("../services/order");

  OrderModel.findByID(order_id)
    .then((order) => {
      let total = 0;

      for (let i = 0; i < order.Order_Items.length; i++) {
        total += order.Order_Items[i].price;
        for (let j = 0; j < order.Order_Items[i].addons.length; j++) {
          total +=
            order.Order_Items[i].addons[j].price *
            order.Order_Items[i].addons[j].quantity;
        }
      }
      let garand_total =
        parseFloat(total) +
        parseFloat(order.additional_cost || 0) -
        parseFloat(
          order.voucher && order.voucher.id
            ? order.voucher.discounted_amount || 0
            : 0,
        );
      if (garand_total < 0) {
        garand_total = 0;
      }

      const settings = require("../config/settings");

      const company_details = {
        name: settings.get("company_name"),
        website: settings.get("company_website"),
        phone: settings.get("company_phone"),
        email: settings.get("company_email"),
        address: settings.get("company_address"),
        about: settings.get("company_about"),
        logo: settings.get("company_logo"),
        account: {
          title: "AUTOMOFY (SMC-PVT) LTD",
          bank: "Alfalah Islamic",
          number: "5001148836",
          branch_code: "5568",
          swift_code: "ALFHPKKA",
          note: "Please save and mention Order Number if you done payment online",
        },
      };
      const moment = require("moment");
      const order_date = moment(order.createdAt)
        .tz(order.client_tz)
        .format("Do, MMMM YYYY h:m:s A");

      const email_data = {
        to: `${order.User.email}`,
        user: order.User,
        subject: `${config.app.title} - Order`,
        order: order,
        order_date: `${order_date} (${order.client_tz})`,
        total: helper.number_with_commas(total),
        additional_cost: helper.number_with_commas(order.additional_cost),
        has_additional_cost: order.additional_cost > 0,
        has_coupon: !!(order.voucher && order.voucher.id),
        coupon: order.voucher,
        grand_total: helper.number_with_commas(garand_total),
        upload_receipt_button: `${config.app.frontendURL}verify-user?token=${order.User.mqtt_token}&order=${order.id}`,
        company_details: company_details,
        order_status: helper.get_order_status(order.status),
      };
      this.order_summary(email_data);

      // Send email to admins
      email_data.to = "asfund.cowlar@gmail.com, team@cowlar.com";
      email_data.subject = `${config.app.title} - New Order Arrived`;
      this.order_summary_for_admins(email_data);
    })
    .catch((err) => {
      logger.error("emails not sent, get order err");
      logger.error(err);
    });
};

exports.two_factor_authentication = (data) => {
  return new Promise((resolve, reject) => {
    const template = fs.readFileSync(
      "./views/emails/two_factor_authentication.html",
      {
        encoding: "utf-8",
      },
    );
    data.expiry_minutes = require("../config/settings").get("TFA_code_expiray");
    const html = ejs.render(template, data);

    const email_params = {
      to: data.to,
      subject: data.subject || config.app.title,
      message: html,
    };

    this.send(email_params)
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

exports.send_complete_registration_email = (user, role) => {
  return new Promise((resolve, reject) => {
    const test_template = fs.readFileSync(
      "./views/emails/complete_registration.html",
      {
        encoding: "utf-8",
      },
    );

    const acctivation_url = new URL(
      `complete-registration?email=${user.email}&name=${user.name}&token=${user.email_token}`,
      config.app.frontendURL,
    );
    const html = ejs.render(test_template, {
      acctivation_url: acctivation_url,
      email: user.email,
      type: role,
      icon_url: new URL("img/icons/mstile-310x150.png", config.app.frontendURL),
      contact_url: contact_url,
      contact_title: contact_title,
    });

    this.send({
      to: user.email,
      subject: "Complete Account Registration | " + config.app.title,
      message: html,
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

exports.reSendRegistrationEmail = (user) => {
  return new Promise(async (resolve, reject) => {
    try {
      const role = user.Role.title;
      const response = await this.send_complete_registration_email(
        { email: user.email, email_token: user.email_token, name: user.name },
        role,
      );
      resolve(response);
    } catch (error) {
      reject(error);
    }
  });
};
