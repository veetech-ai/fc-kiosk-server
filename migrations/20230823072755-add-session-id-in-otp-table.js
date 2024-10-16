"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("OTPs", "session_id", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn("OTPs", "session_id");
  },
};
