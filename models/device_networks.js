"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Networks = sequelize.define(
    "Device_Networks",
    {
      device_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      ssid: DataTypes.STRING,
      password: DataTypes.STRING,
      status: DataTypes.INTEGER,
      priority: DataTypes.INTEGER,
    },
    {},
  );
  Device_Networks.associate = function (models) {
    // associations can be defined here
  };
  return Device_Networks;
};
