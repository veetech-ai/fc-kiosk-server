"use strict";
module.exports = (sequelize, DataTypes) => {
  const Order_Items = sequelize.define(
    "Order_Items",
    {
      order_id: DataTypes.INTEGER,
      product_id: DataTypes.INTEGER,
      quantity: DataTypes.INTEGER,
      shipping_charges: DataTypes.DOUBLE,
      tax: DataTypes.DOUBLE,
      price: DataTypes.DOUBLE,
      total: DataTypes.DOUBLE,
      addons: {
        type: DataTypes.JSON,
        get() {
          return JSON.parse(this.getDataValue("addons"));
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("addons", value);
          } catch (e) {
            this.setDataValue("addons", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  Order_Items.associate = function (models) {
    // associations can be defined here
    models.Order_Items.belongsTo(models.Order, {
      as: "Order",
      foreignKey: "order_id",
    });
    models.Order_Items.belongsTo(models.Product, {
      as: "Product",
      foreignKey: "product_id",
    });
  };
  return Order_Items;
};
