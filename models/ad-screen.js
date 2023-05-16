"use strict";
module.exports = (sequelize, DataTypes) => {
  const Ad_screen = sequelize.define(
    "Ad_screen",
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
  Ad_screen.associate = function (models) {
    // associations can be defined here
    models.Ad_screen.hasMany(models.Ad, {
      as: "Ads",
      foreignKey: "screen_id",
    });
  };
  return Ad_screen;
};
