"use strict";
module.exports = (sequelize, DataTypes) => {
  const Payments = sequelize.define(
    "Payments",
    {
      user_id: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      receive_date: DataTypes.DATE,
      one_time_amount: DataTypes.DOUBLE,
      status: DataTypes.INTEGER,
      coupon_id: DataTypes.INTEGER,
      user_card_id: DataTypes.INTEGER,
      installment_amount: DataTypes.DOUBLE,
      bill_amount: DataTypes.DOUBLE,
      invoice_id: DataTypes.INTEGER,
      invoice_total: DataTypes.DOUBLE,
      payment_option_id: DataTypes.INTEGER,
    },
    {},
  );
  Payments.associate = function (models) {
    // associations can be defined here
  };
  return Payments;
};
