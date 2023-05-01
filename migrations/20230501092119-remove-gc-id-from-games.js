"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remove the gc_id column from the Games table
    await queryInterface.removeColumn("Games", "gc_id");
    await queryInterface.addColumn("Games", "mc_id", {
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
    await queryInterface.removeColumn("Games", "mc_id");
  },
};
