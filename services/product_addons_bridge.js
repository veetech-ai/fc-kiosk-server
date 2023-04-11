const models = require("../models");
const Product_Addons_Bridge = models.Product_Addons_Bridge;

const { logger } = require("../logger");

exports.create = (params) => {
  return new Promise((resolve, reject) => {
    Product_Addons_Bridge.create(params)
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
exports.bulk_create = (params) => {
  try {
    const self = this;
    return new Promise((resolve, reject) => {
      self
        .delete({ product_id: params.product_id })
        .then(() => {
          Product_Addons_Bridge.bulkCreate(params.data)
            .then((data) => {
              resolve(data);
            })
            .catch((err) => {
              logger.error(err);
              reject({
                message: err,
              });
            });
        })
        .catch((err) => {
          logger.error(err);
          reject({
            message: err,
          });
        });
    });
  } catch (err) {
    logger.error(err);
  }
};

exports.delete = (where) => {
  return new Promise((resolve, reject) => {
    Product_Addons_Bridge.destroy({ where: where })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
