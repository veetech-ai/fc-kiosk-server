"use strict";
module.exports = (sequelize, DataTypes) => {
  const Hole = sequelize.define(
    "Hole",
    {
      gId: {
        field: "g_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      mcId: {
        field: "mc_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      userId: {
        field: "user_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      trackedShots: {
        type: DataTypes.JSON,
        field: "tracked_shots",
        allowNull: true,
      },
      noOfShots: {
        type: DataTypes.INTEGER,
        field: "no_of_shots",
        allowNull: true,
      },
      par: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      holeId: {
        type: DataTypes.INTEGER,
        field: "hole_id",
        allowNull: true,
      },
      holeNumber: {
        type: DataTypes.INTEGER,
        field: "hole_number",
        allowNull: true,
      },
      isGir: {
        type: DataTypes.BOOLEAN,
        field: "is_gir",
        defaultValue: false,
      },
      shotsFromGreen: {
        type: DataTypes.INTEGER,
        field: "shots_from_green",
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
    Hole.belongsTo(models.Game, { foreignKey: "g_id" });
    Hole.belongsTo(models.Mobile_Course, { foreignKey: "mc_id" });
    Hole.belongsTo(models.User, { foreignKey: "user_id" });
  };
  return Hole;
};
