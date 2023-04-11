"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Transactions", "decidedBy", {
        allowNull: true,
        type: Sequelize.INTEGER,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Transactions", "decidedBy"),
    ]);
  },
};
