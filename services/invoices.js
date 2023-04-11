const models = require("../models");
const Invoices = models.Invoices;
const moment = require("moment");

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Invoices.findAll({
      // where: {status:1},
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.get_all_user_invoices_without_items = (
  user_id,
  perPage,
  page,
) => {
  return new Promise((resolve, reject) => {
    Invoices.findAll({
      where: { user_id: user_id, status: [0, 1] },
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.get_invoice_with_items = (invoice_id) => {
  return new Promise((resolve, reject) => {
    Invoices.findOne({
      where: { id: invoice_id },
      include: [
        {
          as: "Invoice_Items",
          model: models.Invoice_Items,
          include: [
            {
              as: "Device",
              model: models.Device,
              attributes: ["serial", "device_type"],
              include: [
                {
                  as: "Device_Type",
                  model: models.Product,
                  attributes: ["title", "description"],
                },
              ],
            },
          ],
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.cron_notification_list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Invoices.findAll({
      // raw: true,
      attributes: [
        "id",
        "issue_date",
        "due_date",
        "issue_notice",
        "expire_notice",
      ],
      where: {
        status: 0,
        [Op.or]: [{ issue_notice: 0 }, { expire_notice: 0 }],
      },
      include: [
        {
          as: "User",
          model: models.User,
          attributes: ["id", "name", "email", "phone"],
        },
        {
          as: "Invoice_Items",
          model: models.Invoice_Items,
          attributes: [
            "id",
            "device_id",
            "due_date",
            "one_time_amount",
            "bill_amount",
            "installment_amount",
            "total_amount",
          ],
          where: { status: 0 },
          required: false,
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.get_last_user_invoice = (params) => {
  return new Promise((resolve, reject) => {
    Invoices.findOne({
      where: { status: 0, user_id: params.user_id },
      order: [["issue_date", "DESC"]],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

exports.findByWhere = (where) => {
  return new Promise((resolve, reject) => {
    Invoices.findOne({
      where: where,
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

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Invoices.findOne({
      where: {
        id: id,
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

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    Invoices.findOne({
      where: {
        status: params.status,
        user_id: params.user_id,
        issue_date: {
          [Op.between]: [
            moment(params.issue_date).startOf("day"),
            moment(params.issue_date).endOf("day"),
          ],
        },
      },
    })
      .then((invoice) => {
        if (invoice) {
          resolve(invoice);
        } else {
          // Create new
          Invoices.create(params)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              reject({
                message: err,
              });
            });
        }
      })
      .catch(() => {
        // Create new
        Invoices.create(params)
          .then((data) => {
            resolve(data);
          })
          .catch((err) => {
            reject({
              message: err,
            });
          });
      });
  });
};

exports.create_without_existing_check = (params) => {
  return new Promise((resolve, reject) => {
    Invoices.create(params)
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

exports.create_from_invoice_item = (params) => {
  return new Promise(async (resolve, reject) => {
    const invoice = await Invoices.findOne({
      where: {
        status: 0,
        user_id: params.user_id,
        issue_date: {
          [Op.between]: [
            moment(params.issue_date).startOf("day"),
            moment(params.issue_date).endOf("day"),
          ],
        },
      },
    });
    if (invoice && invoice.id) {
      if (moment(params.due_date).isBefore(moment(invoice.due_date))) {
        await Invoices.update(
          { due_date: params.due_date },
          {
            where: {
              id: invoice.id,
            },
          },
        );
      }
      resolve(invoice);
    } else {
      // Create new
      const data = await Invoices.create(params);
      if (data.id) {
        resolve(data);
      } else {
        reject({
          message: data,
        });
      }
    }
  });
};

exports.update = (id, params) => {
  return new Promise((resolve, reject) => {
    Invoices.update(params, {
      where: {
        id: id,
      },
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

// function idExists (params) {
//   return Invoices.count({
//     where: {
//       status: 0,
//       user_id: params.user_id,
//       issue_date: { [Op.between]: [moment(params.issue_date).startOf('day'), moment(params.issue_date).endOf('day')] }
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
