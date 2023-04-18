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
      otp_created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        field: "otp_created_at",
      },
    },
    {
      sequelize,
      modelName: "OTP",
    },
  );
  return OTP;
};
