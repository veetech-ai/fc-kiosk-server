"use strict";
module.exports = (sequelize, DataTypes) => {
  const Tile = sequelize.define(
    "Tile",
    {
      name: DataTypes.STRING,
      type: DataTypes.STRING,
      url: DataTypes.STRING,
      bgImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      superTileImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      builtIn: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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

  Tile.associate = function (models) {
    Tile.hasMany(models.Course_Tile, { foreignKey: "tileId" });
  };

  return Tile;
};
