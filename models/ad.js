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
      state: {
        field: "state",
        type: DataTypes.STRING,
        allowNull: true,
      },
      screenId: {
        field: "screen_id",
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      title: {
        field: "title",
        type: DataTypes.STRING,
        allowNull: true,
      },
      smallImage: {
        field: "small_image",
        type: DataTypes.STRING,
        allowNull: true,
      },
      bigImage: {
        field: "big_image",
        type: DataTypes.STRING,
        allowNull: true,
      },
      adType: {
        field: "ad_type",
        type: DataTypes.ENUM("kiosk", "mobile"),
        allowNull: true,
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
    Ad.belongsTo(models.Ad_screen, { foreignKey: "screen_id" });
  };
  return Ad;
};
