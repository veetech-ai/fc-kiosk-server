"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      expiry: DataTypes.DATE,
      code: DataTypes.STRING,
      discountType: {
        type: DataTypes.STRING,
        validate: {
          isIn: {
            args: [['fixed', 'percentage']],
            msg: 'Invalid coupon type'
          }
        },
      },
      discount: DataTypes.FLOAT,
      maxUseLimit: DataTypes.INTEGER,
      usedBy: DataTypes.INTEGER,
      couponFor: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      orgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organization",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      gcId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Course",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {},
  );
  Coupon.associate = function (models) {
    // associations can be defined here
    models.Coupon.hasMany(models.Coupon_Used, {
      as: "Coupon_Used",
      foreignKey: "couponId",
    });
    models.Coupon.belongsTo(models.Organization, {
      as: "Organization",
      foreignKey: "orgId",
    });

    models.Coupon.belongsTo(models.Course, {
      as: "Course",
      foreignKey: "gcId",
    });
  };
  return Coupon;
};
