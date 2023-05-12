"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coupon_Used = sequelize.define(
    "Coupon_Used",
    {
      gcId: DataTypes.INTEGER,
      deviceId: DataTypes.INTEGER,
      couponId: DataTypes.INTEGER,
    },
    {},
  );
  Coupon_Used.associate = function (models) {
    // associations can be defined here
    Coupon_Used.belongsTo(models.Coupon, { foreignKey: "gc_id" });
  };
  return Coupon_Used;
};
