"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn("Tiles", "superTileImage", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: async (queryInterface) => {
    return await queryInterface.removeColumn("Tiles", "superTileImage");
  },
};
