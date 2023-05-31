"use strict";
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      mcId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ownerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      participantId: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      participantName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      startTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      totalShotsTaken: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      totalIdealShots: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      teeColor: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gameId: {
        type: DataTypes.STRING,
        allowNull: false,
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
  Game.associate = function (models) {
    // associations can be defined here
    Game.belongsTo(models.Organization, { foreignKey: "org_id" });
    Game.belongsTo(models.Mobile_Course, { foreignKey: "mc_id" });
    Game.belongsTo(models.User, { foreignKey: "owner_id" });
    Game.belongsTo(models.User, { foreignKey: "participant_id" });
    Game.hasMany(models.Hole, {
      as: "Holes",
      foreignKey: "g_id",
    });
  };
  return Game;
};
