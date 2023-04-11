"use strict";
module.exports = (sequelize, DataTypes) => {
  const Mqtt_Logs = sequelize.define(
    "Mqtt_Logs",
    {
      client_id: DataTypes.STRING,
      type: DataTypes.STRING,
      origin: DataTypes.STRING,
      action_datetime: DataTypes.STRING,
      device_serial: DataTypes.STRING,
    },
    {},
  );
  Mqtt_Logs.associate = function (models) {
    // associations can be defined here
  };
  return Mqtt_Logs;
};
