const models = require("../models");
const Product_Categories = models.Product_Categories;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const { logger } = require("../logger");

function idExists(title) {
  return Product_Categories.count({
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

module.exports.list_active = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Product_Categories.findAll({
      where: { status: 1 },
      include: [
        {
          as: "Products",
          model: models.Product,
          require: false,
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

module.exports.list = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Product_Categories.findAll({
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
    Product_Categories.findOne({
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
    Product_Categories.findOne({
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
          Product_Categories.create(params)
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
    Product_Categories.findOne({
      where: {
        title: params.title,
        id: { [Op.ne]: id },
      },
    })
      .then((data) => {
        if (data) {
          reject("exists");
        } else {
          Product_Categories.update(params, {
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
        }
      })
      .catch((err) => {
        reject({
          message: err,
        });
      });
  });
};
