"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Vp_Logs = sequelize.define(
    "Device_Vp_Logs",
    {
      device_id: DataTypes.INTEGER,
      fv: DataTypes.STRING,
      key: DataTypes.STRING,
      value: DataTypes.STRING,
      log: DataTypes.STRING,
      type: DataTypes.INTEGER,
    },
    {},
  );
  Device_Vp_Logs.associate = function (models) {
    // associations can be defined here
  };
  return Device_Vp_Logs;
};
