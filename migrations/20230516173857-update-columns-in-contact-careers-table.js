"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.removeColumn("Contact_Careers", "gc_id"),
      queryInterface.addColumn("Contact_Careers", "gcId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),

      queryInterface.removeColumn("Contact_Careers", "org_id"),
      queryInterface.addColumn("Contact_Careers", "orgId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),

      queryInterface.removeColumn("Contact_Careers", "career_id"),
      queryInterface.addColumn("Contact_Careers", "careerId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Careers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),

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
    return await Promise.all([
      queryInterface.addColumn("Contact_Careers", "gc_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.removeColumn("Contact_Careers", "gcId"),

      queryInterface.addColumn("Contact_Careers", "org_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.removeColumn("Contact_Careers", "orgId"),

      queryInterface.addColumn("Contact_Careers", "career_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Careers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.removeColumn("Contact_Careers", "careerId"),

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
