"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coupons = sequelize.define(
    "Coupons",
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      expiry: DataTypes.DATE,
      code: DataTypes.STRING,
      discount_type: DataTypes.INTEGER,
      discount: DataTypes.FLOAT,
      max_use_limit: DataTypes.INTEGER,
      used_by: DataTypes.INTEGER,
      coupon_for: DataTypes.INTEGER,
      users: DataTypes.STRING,
      device_types: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
    },
    {},
  );
  Coupons.associate = function (models) {
    // associations can be defined here
    models.Coupons.hasMany(models.Coupon_Used, {
      as: "Coupon_Used",
      foreignKey: "coupon_id",
    });
  };
  return Coupons;
};
