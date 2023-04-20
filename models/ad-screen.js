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
  };
  return AdScreen;
};
