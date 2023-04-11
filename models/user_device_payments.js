"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Device_Payments = sequelize.define(
    "User_Device_Payments",
    {
      user_id: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      device_type: DataTypes.INTEGER,
      otp: DataTypes.DOUBLE,
      installments: DataTypes.BOOLEAN,
      installment_total_price: DataTypes.DOUBLE,
      installment_per_month_price: DataTypes.DOUBLE,
      subscription: DataTypes.BOOLEAN,
      subscription_price: DataTypes.DOUBLE,
      billexpiry: DataTypes.DATE,
      billpaid: DataTypes.DATE,
      reg_date: DataTypes.DATE,
      grace_period: DataTypes.INTEGER,
      trial_period: DataTypes.INTEGER,
      trial_ended: DataTypes.BOOLEAN,
      next_bill_date: DataTypes.DATE,
      status: DataTypes.INTEGER,
      bill: DataTypes.BOOLEAN,
    },
    {},
  );
  User_Device_Payments.associate = function (models) {
    // associations can be defined here
    models.User_Device_Payments.belongsTo(models.Product, {
      as: "Device_Type",
      foreignKey: "device_type",
    });

    models.User_Device_Payments.belongsTo(models.User, {
      as: "Owner",
      foreignKey: "user_id",
    });
    models.User_Device_Payments.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
    });
  };
  return User_Device_Payments;
};
