"use strict";

const { logger } = require("../logger");

module.exports = (sequelize, DataTypes) => {
  const User_Addresses = sequelize.define(
    "User_Addresses",
    {
      user_id: DataTypes.INTEGER,
      address: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("address"));
            return JSON.parse(this.getDataValue("address"));
          } catch (e) {
            return this.getDataValue("address");
          }
        },
        set(value) {
          logger.info(`settings: ${value}`);
          try {
            this.setDataValue("address", JSON.parse(value));
          } catch (e) {
            this.setDataValue("address", null);
          }
        },
      },
      is_default: DataTypes.BOOLEAN,
    },
    {},
  );
  User_Addresses.associate = function (models) {
    // associations can be defined here
    models.User_Addresses.belongsTo(models.User, {
      as: "User",
      foreignKey: "user_id",
    });
  };
  return User_Addresses;
};
