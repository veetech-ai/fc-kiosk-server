"use strict";
module.exports = (sequelize, DataTypes) => {
  const Product_Addons_Bridge = sequelize.define(
    "Product_Addons_Bridge",
    {
      product_id: DataTypes.INTEGER,
      addon_id: DataTypes.INTEGER,
    },
    {},
  );
  Product_Addons_Bridge.associate = function (models) {
    // associations can be defined here
    models.Product_Addons_Bridge.belongsTo(models.Product_Addons, {
      as: "Addon",
      foreignKey: "addon_id",
    });
    models.Product_Addons_Bridge.belongsTo(models.Product, {
      as: "Product",
      foreignKey: "product_id",
    });
  };
  return Product_Addons_Bridge;
};
