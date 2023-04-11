const models = require("../models");
const ProductAddonBridgeModel = require("../services/product_addons_bridge");
const ProductAddons = models.Product_Addons;

const { logger } = require("../logger");

function idExists(title) {
  return ProductAddons.count({
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
    ProductAddons.findAll()
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.active_list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    ProductAddons.findAll({ where: { status: 1 } })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.product_addons_list = (product_id, perPage, page) => {
  return new Promise((resolve, reject) => {
    ProductAddons.findAll({ where: { product_id: product_id } })
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
    ProductAddons.findOne({
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
    ProductAddons.findOne({
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
          ProductAddons.create(params)
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
    ProductAddons.update(params, {
      where: {
        id: id,
      },
    })
      .then((result) => {
        if (params.status && params.status != 1) {
          ProductAddonBridgeModel.delete({ addon_id: id })
            .then((result) => {})
            .catch(() => {});
        }
        resolve(result);
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    ProductAddons.update({ status: 2 }, { where: { id: id } })
      .then((result) => {
        resolve(result);
      })
      .catch((err) => {
        reject({ message: err });
      });
  });
};
