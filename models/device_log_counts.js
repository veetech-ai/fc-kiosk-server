"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Log_Counts = sequelize.define(
    "Device_Log_Counts",
    {
      device_id: DataTypes.INTEGER,
      v0_lp: DataTypes.INTEGER,
      v0_hp: DataTypes.INTEGER,
      v0_info: DataTypes.INTEGER,
      vp_lp: DataTypes.INTEGER,
      vp_hp: DataTypes.INTEGER,
      vp_info: DataTypes.INTEGER,
    },
    {},
  );
  Device_Log_Counts.associate = function (models) {
    // associations can be defined here
  };
  return Device_Log_Counts;
};
