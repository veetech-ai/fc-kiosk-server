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
      orderNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      layoutNumber: {
        type: DataTypes.INTEGER,
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

  CourseTile.associate = function (models) {
    CourseTile.hasOne(models.Tile, {
      foreignKey: "id",
    });
    CourseTile.belongsTo(models.Course, {
      foreignKey: "id",
    });
  };
  return CourseTile;
};
