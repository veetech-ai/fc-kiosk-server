"use strict";
module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define(
    "AdScreen",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
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
