"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Wifis = sequelize.define(
    "Device_Wifis",
    {
      wifi_ip: DataTypes.STRING,
      wifi_ssid: DataTypes.STRING,
      device_id: DataTypes.INTEGER,
      current_channel: DataTypes.INTEGER,
      preferred_channel: DataTypes.INTEGER,
    },
    {},
  );
  Device_Wifis.associate = function (models) {
    // associations can be defined here
  };
  return Device_Wifis;
};
