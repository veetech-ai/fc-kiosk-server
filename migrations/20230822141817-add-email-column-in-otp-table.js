"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("OTPs", "email", {
      type: Sequelize.TEXT,
      unique: {
        name: "otp_email_index",
        index: {
          type: Sequelize.STRING(25550),
        },
      },
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn("OTPs", "email");
  },
};
