"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the gc_id column from the Games table
    await queryInterface.removeColumn("Games", "gc_id");
  },

  async down(queryInterface, Sequelize) {
    // Add the gc_id column back to the Games table
    await queryInterface.addColumn("Games", "gc_id", {
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
