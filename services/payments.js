const models = require("../models");
const Payments = models.Payments;

const { logger } = require("../logger");

function idExists(params) {
  return Payments.count({
    where: {
      device_id: params.device_id,
      user_id: params.user_id,
      receive_date: params.receive_date,
      invoice_id: params.invoice_id,
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
    Payments.findAll({
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

exports.findByWhere = (where) => {
  return new Promise((resolve, reject) => {
    Payments.findOne({
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
    Payments.findOne({
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
    idExists(params)
      .then(async (is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          Payments.create(params)
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
    Payments.update(params, {
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
