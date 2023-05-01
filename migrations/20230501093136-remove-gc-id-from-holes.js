"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the gc_id column from the Holes table
    await queryInterface.removeColumn("Holes", "gc_id");
  },

  async down(queryInterface, Sequelize) {
    // Add the gc_id column back to the Holes table
    await queryInterface.addColumn("Holes", "gc_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
  },
};
