"use strict";
const PHONE_AND_EMAIL = require("../models/user_2fa").PHONE_AND_EMAIL;
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("User_2fa", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      type: {
        type: Sequelize.INTEGER(2),
        allowNull: false,
        defaultValue: PHONE_AND_EMAIL,
        comment: "1=both(phone, email), 2=phone, 3=email and 4=combine",
      },
      code: {
        type: Sequelize.STRING(10),
        allowNull: true,
        defaultValue: null,
      },
      expiry: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      resend_tries: {
        type: Sequelize.INTEGER(2),
        allowNull: true,
        defaultValue: 0,
      },
      last_send: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("User_2fa");
  },
};
