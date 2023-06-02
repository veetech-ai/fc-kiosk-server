"use strict";
module.exports = (sequelize, DataTypes) => {
  const Hole = sequelize.define(
    "Hole",
    {
      gId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      gcId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trackedShots: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      noOfShots: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      holeId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      holeNumber: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      isGir: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      shotsFromGreen: {
        type: DataTypes.INTEGER,
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
  Hole.associate = function (models) {
    // associations can be defined here
    Hole.belongsTo(models.Game, { foreignKey: "gId" });
    Hole.belongsTo(models.Mobile_Course, { foreignKey: "gcId" });
    Hole.belongsTo(models.User, { foreignKey: "user_id" });
  };
  return Hole;
};
