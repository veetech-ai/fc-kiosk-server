"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Course_Tiles", "layoutData", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Course_Tiles", "layoutImages", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("Course_Tiles", "bgImage", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn("Course_Tiles", "layoutData");

    await queryInterface.removeColumn("Course_Tiles", "layoutImages");

    await queryInterface.removeColumn("Course_Tiles", "bgImage");
  },
};
