"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product_Info = sequelize.define(
    "Product_Info",
    {
      barcode: {
        type: DataTypes.STRING,
        primaryKey: true,
      },
      product: DataTypes.STRING,
      fiber_count: DataTypes.INTEGER,
    },
    {},
  );
  Product_Info.associate = function (models) {
    // associations can be defined here
  };
  return Product_Info;
};
