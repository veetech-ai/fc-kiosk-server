"use strict";
module.exports = (sequelize, DataTypes) => {
  const User_Settings = sequelize.define(
    "User_Settings",
    {
      user_id: DataTypes.INTEGER,
      config: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("config"));
            return JSON.parse(this.getDataValue("config"));
          } catch (e) {
            return this.getDataValue("config");
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("config", value);
          } catch (e) {
            this.setDataValue("config", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  User_Settings.associate = function (models) {
    // associations can be defined here
  };
  return User_Settings;
};
