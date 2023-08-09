"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tile = sequelize.define(
    "Tile", // to be used for kiosk
    {
      name: DataTypes.STRING,
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

  return Tile;
};
