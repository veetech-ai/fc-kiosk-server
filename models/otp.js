'use strict';
const { Model } = require('sequelize');
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
      otp_createdAt: DataTypes.DATE,
      otp_used: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: 'OTP',
    }
  );
  return OTP;
};