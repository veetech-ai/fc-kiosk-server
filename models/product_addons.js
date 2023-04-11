"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product_Addons = sequelize.define(
    "Product_Addons",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      price: DataTypes.DOUBLE,
      image: DataTypes.STRING,
      status: DataTypes.INTEGER,
      short_description: DataTypes.STRING,
    },
    {},
  );
  Product_Addons.associate = function (models) {
    // associations can be defined here
  };
  return Product_Addons;
};
