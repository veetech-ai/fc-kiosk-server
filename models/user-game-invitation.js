"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Game_Invitation = sequelize.define(
    "User_Game_Invitation",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      invitedBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
      },
      gameId: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          "accepted",
          "declined",
          "invalid",
          "seen",
          "pending",
          "ignored",
        ),
        defaultValue: "pending",
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
  User_Game_Invitation.associate = function (models) {
    // associations can be defined here
    User_Game_Invitation.belongsTo(models.User, {
      as: "User",
      foreignKey: "userId",
    });

    User_Game_Invitation.belongsTo(models.User, {
      as: "Invited_By",
      foreignKey: "invitedBy",
    });
  };
  return User_Game_Invitation;
};
