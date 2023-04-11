"use strict";
module.exports = (sequelize, DataTypes) => {
  const Transaction_Logs = sequelize.define(
    "Transaction_Logs",
    {
      type: DataTypes.STRING,
      device_id: DataTypes.INTEGER,
      session_id: DataTypes.STRING,
      data: DataTypes.JSON,
    },
    {},
  );
  Transaction_Logs.associate = function (models) {
    // associations can be defined here
    models.Transaction_Logs.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
    });
  };
  return Transaction_Logs;
};
