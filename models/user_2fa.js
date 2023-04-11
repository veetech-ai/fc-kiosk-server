"use strict";
const app_settings = require("../config/settings");

const PHONE_AND_EMAIL = 1;
const PHONE = 2;
const EMAIL = 3;
const COMBINE = 4;

module.exports = (sequelize, DataTypes) => {
  const User_2fa = sequelize.define(
    "User_2fa",
    {
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
      },
      type: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: PHONE_AND_EMAIL,
        validate: {
          isIn: [[PHONE_AND_EMAIL, PHONE, EMAIL, COMBINE]],
        },
      },
      code: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          len: app_settings.get("TFA_code_length"),
        },
      },
      expiry: DataTypes.DATE,
      resend_tries: DataTypes.INTEGER,
      last_send: DataTypes.DATE,
      status: DataTypes.INTEGER,
    },
    {
      tableName: "User_2fa",
    },
  );
  User_2fa.associate = function (models) {
    // associations can be defined here
  };
  return User_2fa;
};

module.exports.PHONE_AND_EMAIL = PHONE_AND_EMAIL;
module.exports.PHONE = PHONE;
module.exports.EMAIL = EMAIL;
module.exports.COMBINE = COMBINE;
