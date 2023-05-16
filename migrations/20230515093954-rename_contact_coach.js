"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameTable("Contact_Coach", "Contact_Coaches");
    return queryInterface.addColumn("Contact_Coaches", "is_addressed", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Contact_Coaches", "is_addressed");
    return queryInterface.renameTable("Contact_Coaches", "Contact_Coach");
  },
};
