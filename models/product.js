"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product = sequelize.define(
    "Product",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DOUBLE,
      shipping_charges: DataTypes.DOUBLE,
      tax: DataTypes.DOUBLE,
      image: DataTypes.STRING,
      status: DataTypes.INTEGER,

      subscription_price: DataTypes.DOUBLE,
      installments: DataTypes.BOOLEAN,
      one_time_payment: DataTypes.BOOLEAN,
      subscription: DataTypes.BOOLEAN,
      installment_total_price: DataTypes.DOUBLE,
      installment_per_month_price: DataTypes.DOUBLE,
      grace_period: DataTypes.INTEGER,
      trial_period: DataTypes.INTEGER,

      category_id: DataTypes.INTEGER,

      heading: DataTypes.STRING,
      points: {
        type: DataTypes.JSON,
        get() {
          return this.getDataValue("points")
            ? JSON.parse(this.getDataValue("points"))
            : null;
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("points", value);
          } catch (e) {
            this.setDataValue("points", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  Product.associate = function (models) {
    // associations can be defined here
    models.Product.hasMany(models.Product_Addons_Bridge, {
      as: "Addons",
      foreignKey: "product_id",
    });
    models.Product.hasMany(models.Device, {
      as: "Devices",
      foreignKey: "device_type",
    });
    models.Product.belongsTo(models.Product_Categories, {
      as: "Category",
      foreignKey: "category_id",
    });
  };
  return Product;
};
