"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      expiry: DataTypes.DATE,
      code: DataTypes.STRING,
      discountType: DataTypes.INTEGER,
      discount: DataTypes.FLOAT,
      maxUseLimit: DataTypes.INTEGER,
      usedBy: DataTypes.INTEGER,
      couponFor: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
    },
    {},
  );
  Coupon.associate = function (models) {
    // associations can be defined here
    models.Coupon.hasMany(models.Coupon_Used, {
      as: "Coupon_Used",
      foreignKey: "couponId",
    });
  };
  return Coupons;
};
