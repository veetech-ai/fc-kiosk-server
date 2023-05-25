"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.addColumn("Ads", "title", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      await queryInterface.removeColumn("Ads", "state_id"),
      await queryInterface.removeColumn("Ads", "screen_id"),
      await queryInterface.addColumn("Ads", "state", {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      await queryInterface.addColumn("Ads", "screens", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      }),
      await queryInterface.changeColumn("Ads", "small_image", {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.removeColumn("Ads", "title"),
      await queryInterface.addColumn("Ads", "state_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Country_States",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.addColumn("Ads", "screen_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Ad_screens",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.removeColumn("Ads", "state"),
      await queryInterface.removeColumn("Ads", "screens"),
      await queryInterface.changeColumn("Ads", "small_image", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};
