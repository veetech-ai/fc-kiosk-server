"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn("Contact_Memberships", "contact_medium", {
        type: Sequelize.ENUM("text", "call"),
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.changeColumn("Contact_Memberships", "contact_medium", {
        type: Sequelize.ENUM("phone", "email"),
        allowNull: true,
      }),
    ]);
  },
};
