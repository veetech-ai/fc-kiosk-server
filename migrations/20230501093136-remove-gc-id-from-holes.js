"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the gc_id column from the Holes table
    await queryInterface.removeColumn("Holes", "gc_id");
    await queryInterface.addColumn("Holes", "mc_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Mobile_Courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });
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
    await queryInterface.removeColumn("Holes", "mc_id");
  },
};
