"use strict";
module.exports = (sequelize, DataTypes) => {
  const Ad = sequelize.define(
    "Ad",
    {
      gcId: {
        field: "gc_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      smallImage: {
        field: "small_image",
        type: DataTypes.STRING,
        allowNull: false,
      },
      bigImage: {
        field: "big_image",
        type: DataTypes.STRING,
        allowNull: true,
      },
      screens: {
        type: DataTypes.JSON,
      },
      state: {
        type: DataTypes.STRING,
      },
      title: {
        type: DataTypes.STRING,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {},
  );
  Ad.associate = function (models) {
    // associations can be defined here
    Ad.belongsTo(models.Organization, { foreignKey: "org_id" });
    Ad.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return Ad;
};
