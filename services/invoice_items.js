const models = require("../models");
const Invoice_Items = models.Invoice_Items;
const InvoicesModel = require("../services/invoices");

const { logger } = require("../logger");

function idExists(params) {
  return Invoice_Items.count({
    where: {
      device_id: params.device_id,
      user_id: params.user_id,
      issue_date: params.issue_date,
      status: 0,
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

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Invoice_Items.findAll({
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

module.exports.get_last_user_device_invoice_item = (params) => {
  return new Promise((resolve, reject) => {
    Invoice_Items.findOne({
      where: {
        status: 0,
        user_id: params.user_id,
        device_id: params.device_id,
      },
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
    Invoice_Items.findOne({
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
    Invoice_Items.findOne({
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

exports.findByID_detailed = (id) => {
  return new Promise((resolve, reject) => {
    Invoice_Items.findOne({
      where: {
        id: id,
      },
      include: [
        {
          as: "Invoice",
          model: models.Invoices,
          include: [
            {
              as: "Invoice_Items",
              model: models.Invoice_Items,
            },
          ],
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

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    idExists(params)
      .then(async (is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          Invoice_Items.create(params)
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
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.create_with_invoice = (params) => {
  return new Promise((resolve, reject) => {
    idExists(params)
      .then(async (is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          const invoice = await InvoicesModel.create_from_invoice_item(params);
          params.invoice_id = invoice.id || null;
          Invoice_Items.create(params)
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
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.update = (id, params) => {
  return new Promise((resolve, reject) => {
    Invoice_Items.update(params, {
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
exports.update_where = (params, where) => {
  return new Promise((resolve, reject) => {
    Invoice_Items.update(params, {
      where: where,
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
