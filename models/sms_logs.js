"use strict";
module.exports = (sequelize, DataTypes) => {
  const SMS_Logs = sequelize.define(
    "SMS_Logs",
    {
      to: DataTypes.STRING,
      from: DataTypes.STRING,
      accountSid: DataTypes.STRING,
      body: DataTypes.STRING,
      sid: DataTypes.STRING,
      exception: DataTypes.STRING,
    },
    {},
  );
  SMS_Logs.associate = function (models) {
    // associations can be defined here
  };
  return SMS_Logs;
};
