"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Invitations = sequelize.define(
    "User_Invitations",
    {
      email: DataTypes.STRING,
      name: DataTypes.STRING,
      invitation_token: DataTypes.STRING,
      invite_by_user: DataTypes.INTEGER,
      invite_from: DataTypes.STRING,
      status: DataTypes.TINYINT,
    },
    {},
  );
  User_Invitations.associate = function (models) {
    // associations can be defined here
  };
  return User_Invitations;
};
