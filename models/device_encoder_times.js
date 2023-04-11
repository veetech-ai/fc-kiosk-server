"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Encoder_Times = sequelize.define(
    "Device_Encoder_Times",
    {
      device_id: DataTypes.INTEGER,
      start: DataTypes.INTEGER,
      end: DataTypes.INTEGER,
      time: DataTypes.INTEGER,
    },
    {},
  );
  Device_Encoder_Times.associate = function (models) {
    // associations can be defined here
  };
  return Device_Encoder_Times;
};
