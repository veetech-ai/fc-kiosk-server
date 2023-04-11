"use strict";
module.exports = (sequelize, DataTypes) => {
  const DScopeReports = sequelize.define(
    "DScopeReports",
    {
      date: DataTypes.DATE,
      serialNumber: DataTypes.STRING,
      blinkInfo: DataTypes.STRING,
      stationSerial: DataTypes.STRING,
      images: DataTypes.STRING,
    },
    {},
  );
  DScopeReports.associate = function (models) {
    // associations can be defined here
  };
  return DScopeReports;
};
