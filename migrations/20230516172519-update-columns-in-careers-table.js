"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Careers", "gc_id", "gcId"),

      queryInterface.renameColumn("Careers", "org_id", "orgId"),

      queryInterface.changeColumn("Careers", "title", {
        type: Sequelize.STRING,
        allowNull: false,
      }),

      queryInterface.changeColumn("Careers", "content", {
        type: Sequelize.TEXT,
        allowNull: false,
      }),

      queryInterface.changeColumn("Careers", "type", {
        type: Sequelize.STRING,
        allowNull: false,
      }),

      queryInterface.changeColumn("Careers", "timings", {
        type: Sequelize.JSON,
        allowNull: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.renameColumn("Careers", "gcId", "gc_id"),
      queryInterface.renameColumn("Careers", "orgId", "org_id"),

      queryInterface.changeColumn("Careers", "title", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn("Careers", "content", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn("Careers", "type", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn("Careers", "timings", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};
