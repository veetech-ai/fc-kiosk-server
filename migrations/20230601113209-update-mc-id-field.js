"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.renameColumn("Games", "mcId", "gcId"),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.renameColumn("Games", "gcId", "mcId"),
    ]);
  },
};
