"use strict";
module.exports = (sequelize, DataTypes) => {
  const AdScreen = sequelize.define(
    "AdScreen",
    {
      name: {
        type: DataTypes.STRING,
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
  AdScreen.associate = function (models) {
    // associations can be defined here
    models.AdScreen.hasMany(models.Ad, {
      as: "Ads",
      foreignKey: "screen_id",
    });
  };
  return AdScreen;
};
