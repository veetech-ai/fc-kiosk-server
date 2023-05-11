"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DeviceOnboardingCode extends Model {
    static associate(models) {
      // Define any associations here
    }
  }
  DeviceOnboardingCode.init(
    {
      code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
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
    {
      sequelize,
      tableName: "Device_Onboarding_Codes",
    },
  );
  return DeviceOnboardingCode;
};
