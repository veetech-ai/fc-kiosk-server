const models = require("../models");
const Payment_Options = models.Payment_Options;

const { logger } = require("../logger");

function idExists(title) {
  return Payment_Options.count({
    where: {
      title: title,
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
    Payment_Options.findAll({})
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.list_available = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Payment_Options.findAll({
      where: { status: 1 },
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
    Payment_Options.findOne({
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
    Payment_Options.findOne({
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
    idExists(params.title)
      .then((is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          Payment_Options.create(params)
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
    if (params.title) {
      delete params.title;
    }
    Payment_Options.update(params, {
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
