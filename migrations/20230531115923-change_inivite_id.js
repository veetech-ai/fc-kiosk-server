"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "Games",
        "invite_id",
        "game_id",
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "Games",
        "game_id",
        "invite_id",
      ),
    ]);
  },
};