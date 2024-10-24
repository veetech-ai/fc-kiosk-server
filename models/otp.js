"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OTP extends Model {
    static associate(models) {
      // Define any associations here
    }
  }
  OTP.init(
    {
      phone: {
        type: DataTypes.STRING,
        unique: true,
      },
      code: DataTypes.STRING,
      session_id: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      createdAt: {
        type: DataTypes.DATE,
      },
      updatedAt: {
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "OTP",
    },
  );
  return OTP;
};
