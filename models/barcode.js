"use strict";
module.exports = (sequelize, DataTypes) => {
  const Barcode = sequelize.define(
    "Barcode",
    {
      barcode: DataTypes.STRING,
      stationId: DataTypes.INTEGER,
      lastStationId: DataTypes.INTEGER,
      rework: DataTypes.INTEGER,
      status: DataTypes.INTEGER,
      startTime: DataTypes.DATE,
      trolleyId: DataTypes.INTEGER,
      product: DataTypes.STRING,
      endTime: DataTypes.DATE,
      journey: DataTypes.JSON,
    },
    {},
  );
  Barcode.associate = function (models) {
    // associations can be defined here
  };
  return Barcode;
};
