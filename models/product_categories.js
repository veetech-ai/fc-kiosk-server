"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product_Categories = sequelize.define(
    "Product_Categories",
    {
      title: DataTypes.STRING,
      status: DataTypes.INTEGER,
      description: DataTypes.STRING,
    },
    {},
  );
  Product_Categories.associate = function (models) {
    // associations can be defined here
    models.Product_Categories.hasMany(models.Product, {
      as: "Products",
      foreignKey: "category_id",
    });
  };
  return Product_Categories;
};
