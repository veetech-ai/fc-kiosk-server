"use strict";
module.exports = (sequelize, DataTypes) => {
  const CourseTile = sequelize.define(
    "Course_Tile", // to be used for kiosk
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      isPublished: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      isSuperTile: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      order: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      layoutNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      tileId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Tiles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      gcId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
        onUpdate: DataTypes.literal("CURRENT_TIMESTAMP"),
      },
    },
    {},
  );
  CourseTile.associate = function (models) {
    CourseTile.hasMany(models.Tile, {
      as: "Tile",
      foreignKey: "tileId",
    });
    CourseTile.belongsTo(models.Course, {
      as: "Course",
      foreignKey: "gcId",
    });
  };
  return CourseTile;
};
