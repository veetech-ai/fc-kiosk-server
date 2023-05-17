"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.changeColumn(
        "Contact_Memberships",
        "contact_medium",
        {
          type: Sequelize.ENUM("text", "call"),
          allowNull: true,
        },
      ),
      await queryInterface.addColumn("Contact_Memberships", "is_addressed", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.changeColumn(
        "Contact_Memberships",
        "contact_medium",
        {
          type: Sequelize.ENUM("phone", "email"),
          allowNull: true,
        },
      ),
      await queryInterface.removeColumn("Contact_Memberships", "is_addressed"),
    ]);
  },
};
