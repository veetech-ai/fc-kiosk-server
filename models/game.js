"use strict";
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
      mcId: {
        field: "mc_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      ownerId: {
        field: "owner_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      participantId: {
        field: "participant_id",
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      participantName: {
        field: "participant_name",
        type: DataTypes.STRING,
        allowNull: true,
      },
      startTime: {
        field: "start_time",
        type: DataTypes.DATE,
        allowNull: true,
      },
      endTime: {
        field: "end_time",
        type: DataTypes.DATE,
        allowNull: true,
      },
      totalShotsTaken: {
        field: "total_shots_taken",
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      totalIdealShots: {
        field: "total_ideal_shots",
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      inviteId: {
        field: "invite_id",
        type: DataTypes.STRING,
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
