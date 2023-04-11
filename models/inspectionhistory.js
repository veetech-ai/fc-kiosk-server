"use strict";
module.exports = (sequelize, DataTypes) => {
  const Inspection = sequelize.define(
    "Inspection",
    {
      date: DataTypes.DATE,
      serialNo: DataTypes.INTEGER,
      stationSerialNo: DataTypes.STRING,
      globalPass: {
        type: DataTypes.ENUM,
        values: ["fail", "pass", "unknown"],
      },
      sampleName: DataTypes.STRING,
      operator: DataTypes.STRING,
      data: DataTypes.STRING,
    },
    {},
  );
  Inspection.associate = function (models) {
    // associations can be defined here
  };
  return Inspection;
};
