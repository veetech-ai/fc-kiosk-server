"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tile = sequelize.define(
    "Tile",
    {
      name: DataTypes.STRING,
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

  Tile.associate = function (models) {
    Tile.hasOne(models.Course_Tile, { foreignKey: "tileId" });
  };

  return Tile;
};
