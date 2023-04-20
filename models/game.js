"use strict";
module.exports = (sequelize, DataTypes) => {
  const Game = sequelize.define(
    "Game",
    {
        gcId: {
            field:"gc_id"
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          orgId: {
            field:"org_id"
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          ownerId: {
            field:"owner_id"
            type: DataTypes.INTEGER,
            allowNull: false,
          },
          participantId: {
            field:"participant_id"
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          participantName: {
            field:"participant_name"
            type: DataTypes.STRING,
            allowNull: true,
          },
          startTime: {
            field:"start_time"
            type: DataTypes.DATE,
            allowNull: true,
          },
          endTime: {
            field:"end_time"
            type: DataTypes.DATE,
            allowNull: true,
          },
          totalShotsTaken: {
            field:"total_shots_taken"
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          totalIdealShots: {
            field:"total_ideal_shots"
            type: DataTypes.INTEGER,
            allowNull: true,
          },
          inviteId: {
            type:"invite_id"
            type: DataTypes.STRING,
            allowNull: true,
          },
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
  Game.associate = function (models) {
    // associations can be defined here
    Game.belongsTo(models.Organization, { foreignKey: "org_id" });
    Game.belongsTo(models.Course, { foreignKey: "gc_id" });
    Game.belongsTo(models.User, { foreignKey: "owner_id" });
    Game.belongsTo(models.User, { foreignKey: "participant_id" });
  };
  return Game;
};
