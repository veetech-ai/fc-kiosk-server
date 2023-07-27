"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.removeColumn("Ads", "gcId");
    await queryInterface.removeColumn("Ads", "screens");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Ads", "gcId", {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "Mobile_Course",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    });

    await queryInterface.addColumn("Ads", "screens", {
      type: Sequelize.JSON,
      allowNull: false,
    });
  },
};
