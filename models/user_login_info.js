"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Login_Info = sequelize.define(
    "User_Login_Info",
    {
      user_id: DataTypes.INTEGER,
      info: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("info"));
            return JSON.parse(this.getDataValue("info"));
          } catch (e) {
            return this.getDataValue("info");
          }
        },
        set(value) {
          try {
            this.setDataValue("info", JSON.parse(value));
          } catch (e) {
            this.setDataValue("info", null);
          }
        },
      },
    },
    {},
  );
  User_Login_Info.associate = function (models) {
    // associations can be defined here
  };
  return User_Login_Info;
};
