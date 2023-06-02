"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("Roles", "manage_games", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.removeColumn("Roles", "manage_games"),
    ]);
  },
};
