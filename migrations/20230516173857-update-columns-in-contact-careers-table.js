"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Contact_Careers", "gc_id", "gcId"),
      queryInterface.renameColumn("Contact_Careers", "org_id", "orgId"),
      queryInterface.renameColumn("Contact_Careers", "career_id", "careerId"),
      queryInterface.renameColumn("Contact_Careers", "user_phone", "phone"),

      queryInterface.renameColumn("Contact_Careers", "user_email", "email"),

      queryInterface.removeColumn("Contact_Careers", "contact_medium"),
      queryInterface.addColumn("Contact_Careers", "contactMedium", {
        type: Sequelize.ENUM("text", "call"),
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Contact_Careers", "gcId", "gc_id"),
      queryInterface.renameColumn("Contact_Careers", "orgId", "org_id"),
      queryInterface.renameColumn("Contact_Careers", "careerId", "career_id"),

      queryInterface.addColumn("Contact_Careers", "contact_medium", {
        type: Sequelize.ENUM("phone", "email"),
        allowNull: true,
      }),
      queryInterface.removeColumn("Contact_Careers", "contactMedium"),

      queryInterface.renameColumn("Contact_Careers", "phone", "user_phone"),

      queryInterface.renameColumn("Contact_Careers", "email", "user_email"),
    ]);
  },
};
