"use strict";
module.exports = (sequelize, DataTypes) => {
  const Order = sequelize.define(
    "Order",
    {
      user_id: DataTypes.INTEGER,
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      ip_address: DataTypes.STRING,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      contactNumber: DataTypes.INTEGER,
      billingAddress: DataTypes.STRING,
      status: DataTypes.INTEGER,
      payment_method: DataTypes.INTEGER,
      notes: DataTypes.TEXT,
      payment_info: {
        type: DataTypes.JSON,
        get() {
          return this.getDataValue("payment_info")
            ? JSON.parse(this.getDataValue("payment_info"))
            : null;
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("payment_info", value);
          } catch (e) {
            this.setDataValue("payment_info", JSON.stringify(value));
          }
        },
      },
      shipping_address: {
        type: DataTypes.JSON,
        get() {
          return this.getDataValue("shipping_address")
            ? JSON.parse(this.getDataValue("shipping_address"))
            : JSON.parse("{}");
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("shipping_address", value);
          } catch (e) {
            this.setDataValue("shipping_address", JSON.stringify(value));
          }
        },
      },
      voucher: {
        type: DataTypes.JSON,
        get() {
          return this.getDataValue("voucher")
            ? JSON.parse(this.getDataValue("voucher"))
            : null;
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("voucher", value);
          } catch (e) {
            this.setDataValue("voucher", JSON.stringify(value));
          }
        },
      },
      reference: DataTypes.INTEGER,
      additional_cost: DataTypes.DOUBLE,
      client_tz: DataTypes.STRING,
    },
    {},
  );
  Order.associate = function (models) {
    // associations can be defined here
    models.Order.hasMany(models.Order_Items, {
      as: "Order_Items",
      foreignKey: "order_id",
    });
    models.Order.belongsTo(models.User, { as: "User", foreignKey: "user_id" });
    models.Order.belongsTo(models.Organization, {
      as: "Organization",
      foreignKey: "org_id",
    });
  };
  return Order;
};
