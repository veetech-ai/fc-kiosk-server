"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("FAQs", "gc_id");
    await queryInterface.removeColumn("FAQs", "org_id");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("FAQs", "gc_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
    await queryInterface.addColumn("FAQs", "org_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Organizations",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
