const models = require("../models");
const Order = models.Order;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

Order.beforeCreate(async (new_order) => {
  const last_order = await Order.findOne({
    attributes: ["id", "reference"],
    where: { reference: { [Op.ne]: null } },
    limit: 1,
    order: [["id", "DESC"]],
  });

  let reference = 1000;
  if (last_order && last_order.id && last_order.reference) {
    reference = parseInt(last_order.reference) + 1;
  }
  new_order.reference = reference;
});

module.exports.list = (perPage, page, where = false) => {
  return new Promise((resolve, reject) => {
    const query = {
      include: [
        {
          as: "Order_Items",
          model: models.Order_Items,
          attributes: [
            "id",
            "product_id",
            "quantity",
            "shipping_charges",
            "tax",
            "price",
            "addons",
            "total",
          ],
          required: false,
        },
        {
          as: "User",
          model: models.User,
          attributes: ["id", "name", "email", "phone", "status"],
          required: false,
        },
        {
          as: "Organization",
          model: models.Organization,
          attributes: ["id", "name"],
          required: false,
        },
      ],
    };

    if (where) {
      query.where = where;
    }

    Order.findAll(query)
      .then((result) => {
        resolve(result);
      })
      .catch((error) => {
        reject(error);
      });
  });
};

module.exports.my_list = (orgId, perPage, page) => {
  const where = {};
  if (orgId) where.orgId = orgId;
  return new Promise((resolve, reject) => {
    Order.findAll({
      where,
      include: [
        {
          as: "Order_Items",
          model: models.Order_Items,
          attributes: [
            "id",
            "product_id",
            "quantity",
            "shipping_charges",
            "tax",
            "price",
            "addons",
            "total",
          ],
          required: false,
        },
        {
          as: "User",
          model: models.User,
          attributes: ["id", "name", "email", "phone", "status"],
          required: false,
        },
        {
          as: "Organization",
          model: models.Organization,
          attributes: ["id", "name"],
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

exports.findByWhere = (where) => {
  return new Promise((resolve, reject) => {
    Order.findOne({
      where: where,
      include: [
        {
          as: "Order_Items",
          model: models.Order_Items,
          attributes: [
            "id",
            "product_id",
            "quantity",
            "shipping_charges",
            "tax",
            "price",
            "addons",
            "total",
          ],
          required: false,
          include: [
            {
              as: "Product",
              model: models.Product,
              attributes: ["title", "shipping_charges", "tax", "price"],
              required: false,
            },
          ],
        },
        {
          as: "User",
          model: models.User,
          attributes: ["id", "name", "email", "phone", "status"],
          required: false,
        },
        {
          as: "Organization",
          model: models.Organization,
          attributes: ["id", "name"],
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
    Order.findOne({
      where: {
        id: id,
      },
      include: [
        {
          as: "Order_Items",
          model: models.Order_Items,
          attributes: [
            "id",
            "product_id",
            "quantity",
            "shipping_charges",
            "tax",
            "price",
            "addons",
            "total",
          ],
          required: false,
          include: [
            {
              as: "Product",
              model: models.Product,
              attributes: ["title", "shipping_charges", "tax", "price"],
              required: false,
            },
          ],
        },
        {
          as: "User",
          model: models.User,
          attributes: ["id", "name", "email", "phone", "status", "mqtt_token"],
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

exports.getLastPendingOrder = (user_id) => {
  return new Promise((resolve, reject) => {
    Order.findOne({
      where: {
        user_id: user_id,
        status: 0,
      },
      include: [
        {
          as: "Order_Items",
          model: models.Order_Items,
          attributes: [
            "id",
            "product_id",
            "quantity",
            "shipping_charges",
            "tax",
            "price",
            "addons",
            "total",
          ],
          required: false,
          include: [
            {
              as: "Product",
              model: models.Product,
              attributes: ["title", "shipping_charges", "tax", "price"],
              required: false,
            },
          ],
        },
        {
          as: "User",
          model: models.User,
          attributes: ["id", "name", "email", "phone", "status", "mqtt_token"],
          required: false,
        },
      ],
      order: [["id", "DESC"]],
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
    Order.create(params)
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

exports.update = (id, params) => {
  return new Promise((resolve, reject) => {
    Order.update(params, {
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
