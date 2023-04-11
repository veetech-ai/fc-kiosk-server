"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coupon_Used = sequelize.define(
    "Coupon_Used",
    {
      user_id: DataTypes.INTEGER,
      coupon_id: DataTypes.INTEGER,
    },
    {},
  );
  Coupon_Used.associate = function (models) {
    // associations can be defined here
  };
  return Coupon_Used;
};
