const Sequelize = require("sequelize");
const Op = Sequelize.Op;
const settings = require("../config/settings");

const models = require("../models");
const Product = models.Product;

const { logger } = require("../logger");

function isExists(title, id = false) {
  const where = {
    title: title,
  };

  if (id) {
    where.id = {
      [Op.ne]: id,
    };
  }

  return Product.count({
    where: where,
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
    Product.findAll({
      // attributes: ['id', 'title', 'description', 'price', 'shipping_charges', 'tax', 'image', 'status', 'createdAt', 'updatedAt', 'subscription_price', 'installments', 'one_time_payment', 'subscription', 'installment_total_price', 'installment_per_month_price', ],
      // where: {status:1},
      include: [
        {
          as: "Category",
          model: models.Product_Categories,
          required: false,
        },
        {
          as: "Addons",
          model: models.Product_Addons_Bridge,
          attributes: ["id"],
          include: [
            {
              as: "Addon",
              model: models.Product_Addons,
              attributes: [
                "id",
                "title",
                "short_description",
                "description",
                "price",
                "image",
              ],
              where: {
                status: 1,
              },
              required: false,
            },
          ],
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

exports.list_selective = (perPage, page, ids) => {
  return new Promise((resolve, reject) => {
    Product.findAll({
      attributes: [
        "id",
        "title",
        "image",
        "status",
        "installments",
        "one_time_payment",
        "subscription",
      ],
      where: {
        id: {
          [Sequelize.Op.in]: ids,
        },
      },
      include: [
        {
          as: "Category",
          model: models.Product_Categories,
          required: false,
        },
      ],
    })
      .then((users) => {
        resolve(users);
      })
      .catch((error) => {
        logger.error(error);
        reject(error);
      });
  });
};

module.exports.list_active = (perPage, page) => {
  return new Promise((resolve, reject) => {
    Product.findAll({
      where: {
        status: 1,
      },
      // attributes: ['id', 'title', 'description', 'price', 'shipping_charges', 'tax', 'image', 'status', 'createdAt', 'updatedAt', 'subscription_price', 'installments', 'one_time_payment', 'subscription', 'installment_total_price', 'installment_per_month_price', ],
      include: [
        {
          as: "Category",
          model: models.Product_Categories,
          required: false,
        },
      ],
    })
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        logger.error(error);
        reject(error);
      });
  });
};

exports.findByWhere = (where) => {
  return new Promise((resolve, reject) => {
    Product.findOne({
      where: where,
      // attributes: ['id', 'title', 'description', 'price', 'shipping_charges', 'tax', 'image', 'status', 'createdAt', 'updatedAt', 'subscription_price', 'installments', 'one_time_payment', 'subscription', 'installment_total_price', 'installment_per_month_price', ],
      include: [
        {
          as: "Category",
          model: models.Product_Categories,
          required: false,
        },
        {
          as: "Addons",
          model: models.Product_Addons_Bridge,
          attributes: ["id"],
          include: [
            {
              as: "Addon",
              model: models.Product_Addons,
              attributes: [
                "id",
                "title",
                "short_description",
                "description",
                "price",
                "image",
              ],
              where: {
                status: 1,
              },
              required: false,
            },
          ],
          required: false,
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

exports.findByID = (id) => {
  return new Promise((resolve, reject) => {
    Product.findOne({
      // attributes: ['id', 'title', 'description', 'price', 'shipping_charges', 'tax', 'image', 'status', 'createdAt', 'updatedAt', 'subscription_price', 'installments', 'one_time_payment', 'subscription', 'installment_total_price', 'installment_per_month_price', ],
      where: {
        id: id,
        // status:1
      },
      include: [
        {
          as: "Category",
          model: models.Product_Categories,
          required: false,
        },
        {
          as: "Addons",
          model: models.Product_Addons_Bridge,
          attributes: ["id"],
          include: [
            {
              as: "Addon",
              model: models.Product_Addons,
              attributes: [
                "id",
                "title",
                "short_description",
                "description",
                "price",
                "image",
              ],
              where: {
                status: 1,
              },
              required: false,
            },
          ],
          required: false,
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

exports.getLastActiveSingle = () => {
  return new Promise((resolve, reject) => {
    Product.findOne({
      // attributes: ['id', 'title', 'description', 'price', 'shipping_charges', 'tax', 'image', 'status', 'createdAt', 'updatedAt', 'subscription_price', 'installments', 'one_time_payment', 'subscription', 'installment_total_price', 'installment_per_month_price', ],
      where: {
        status: 1,
        id: settings.get("default_device_type"),
      },
      limit: 1,
      order: [["id", "DESC"]],
      include: [
        {
          as: "Category",
          model: models.Product_Categories,
          required: false,
        },
        {
          as: "Addons",
          model: models.Product_Addons_Bridge,
          attributes: ["id"],
          required: false,
          include: [
            {
              as: "Addon",
              model: models.Product_Addons,
              attributes: [
                "id",
                "title",
                "short_description",
                "description",
                "price",
                "image",
              ],
              where: {
                status: 1,
              },
              required: false,
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
    isExists(params.title)
      .then((is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          // Create new
          Product.create(params)
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
    isExists(params.title, id)
      .then((is_exists) => {
        if (is_exists) {
          reject("exists");
        } else {
          Product.update(params, {
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

exports.delete = (id) => {
  return new Promise((resolve, reject) => {
    Product.update(
      {
        status: 2,
      },
      {
        where: {
          id: id,
        },
      },
    )
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
