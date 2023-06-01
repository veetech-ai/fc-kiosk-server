"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.renameColumn("Holes", "mcId", "gcId"),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.renameColumn("Holes", "gcId", "mcId"),
    ]);
  },
};
