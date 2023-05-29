"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coupon = sequelize.define(
    "Coupon",
    {
      title: DataTypes.STRING,
      description: DataTypes.STRING,
      expiry: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      discountType: DataTypes.ENUM("fixed", "percentage"),
      discount: DataTypes.FLOAT,
      maxUseLimit: DataTypes.INTEGER,
      usedBy: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      orgId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Organization",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      gcId: {
        type: DataTypes.INTEGER,
        references: {
          model: "Course",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {
      timestamps: true,
    },
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
