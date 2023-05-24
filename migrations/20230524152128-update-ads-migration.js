"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.addColumn("Ads", "title", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.removeColumn("Ads", "state_id"),
      queryInterface.removeColumn("Ads", "screen_id"),
      queryInterface.addColumn("Ads", "state", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Ads", "screens", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return await Promise.all([
      queryInterface.removeColumn("Ads", "title"),
      queryInterface.addColumn("Ads", "state_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Country_States",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn("Ads", "screen_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Ad_screens",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.removeColumn("Ads", "state"),
      queryInterface.removeColumn("Ads", "screens"),
    ]);
  },
};
