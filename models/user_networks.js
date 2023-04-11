"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Networks = sequelize.define(
    "User_Networks",
    {
      user_id: DataTypes.INTEGER,
      ssid: DataTypes.STRING,
      password: DataTypes.STRING,
      status: DataTypes.INTEGER,
    },
    {},
  );
  User_Networks.associate = function (models) {
    // associations can be defined here
  };
  return User_Networks;
};
