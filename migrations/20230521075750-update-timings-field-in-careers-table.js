"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.changeColumn("Careers", "timings", {
        type: Sequelize.JSON,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.changeColumn("Careers", "timings", {
        type: Sequelize.JSON,
        allowNull: false,
      }),
    ]);
  },
};
