"use strict";
module.exports = (sequelize, DataTypes) => {
  const Transactions = sequelize.define(
    "Transactions",
    {
      session_id: DataTypes.STRING,
      device_id: DataTypes.INTEGER,
      service: DataTypes.STRING,
      status: DataTypes.STRING,
      fault: DataTypes.STRING,
      feedback: DataTypes.DOUBLE,
      time_spent: DataTypes.INTEGER,
      mobile_number: DataTypes.STRING,
      cnic: DataTypes.STRING,
      screen_number: DataTypes.INTEGER,
      language: DataTypes.STRING,
      IMSI: DataTypes.STRING,
      number_selection: DataTypes.STRING,
      sim_accepted: DataTypes.STRING,
      package_name: DataTypes.STRING,
      billing: DataTypes.STRING,
      passport_number: DataTypes.STRING,
      foreign_transaction_status: DataTypes.INTEGER,
      passport_picture: DataTypes.STRING,
      passport_score: DataTypes.STRING,
      user_picture: DataTypes.STRING,
      user_video: DataTypes.STRING,
      liveness_score: DataTypes.STRING,
      endedAt: DataTypes.DATE,
      approvalDecisionAt: DataTypes.DATE,
      decidedBy: DataTypes.INTEGER,
    },
    {},
  );
  Transactions.associate = function (models) {
    // associations can be defined here
    models.Transactions.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
    });
  };
  return Transactions;
};
