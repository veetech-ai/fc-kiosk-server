"use strict";
module.exports = (sequelize, DataTypes) => {
  const CourseTile = sequelize.define(
    "Course_Tile",
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
        type: DataTypes.ENUM(0, 1, 2, 3),
        allowNull: false,
        description:
          "Which layout to show for the particular tile, 0 for default, and 1,2, and 3 for custom layouts",
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
      foreignKey: "tileId",
    });
    CourseTile.belongsTo(models.Course, {
      foreignKey: "gcId",
    });
  };
  return CourseTile;
};
