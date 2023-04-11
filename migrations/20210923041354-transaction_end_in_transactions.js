"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Transactions", "endedAt", {
        allowNull: true,
        type: Sequelize.DATE,
        defaultValue: null,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Transactions", "endedAt"),
    ]);
  },
};
