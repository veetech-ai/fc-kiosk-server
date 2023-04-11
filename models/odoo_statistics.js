"use strict";
module.exports = (sequelize, DataTypes) => {
  const Odoo_Statistics = sequelize.define(
    "Odoo_Statistics",
    {
      barcode: DataTypes.STRING,
      responseTime: DataTypes.INTEGER,
      response: DataTypes.STRING,
    },
    {},
  );
  Odoo_Statistics.associate = function (models) {
    // associations can be defined here
  };
  return Odoo_Statistics;
};
