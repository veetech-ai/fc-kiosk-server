"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Transactions_Attachments", "session_id", {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Transactions_Attachments", "session_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
    ]);
  },
};
