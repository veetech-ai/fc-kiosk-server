"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Device_Installments = sequelize.define(
    "User_Device_Installments",
    {
      user_id: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      payment_date: DataTypes.DATE,
      payment_amount: DataTypes.DOUBLE,
      status: DataTypes.INTEGER,
    },
    {},
  );
  User_Device_Installments.associate = function (models) {
    // associations can be defined here
  };
  return User_Device_Installments;
};
