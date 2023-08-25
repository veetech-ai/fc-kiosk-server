"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("Signed_Waivers", "phone", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.changeColumn("Signed_Waivers", "email", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Signed_Waivers", "phone");

    // Revert the changes for 'email' column
    await queryInterface.changeColumn("Signed_Waivers", "email", {
      type: Sequelize.STRING,
      allowNull: false, // Set back to original allowNull value
    });
  },
};
