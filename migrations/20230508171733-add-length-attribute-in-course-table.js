"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.addColumn("Courses", "length", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      await queryInterface.addColumn("Courses", "email", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Courses", "length");
    await queryInterface.removeColumn("Courses", "email");
  },
};
