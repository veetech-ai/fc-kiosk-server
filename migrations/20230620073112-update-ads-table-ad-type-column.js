"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Ads", "ad_type");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Ads", "ad_type", {
      type: Sequelize.ENUM("kiosk", "mobile"),
      allowNull: true,
    });
  },
};
