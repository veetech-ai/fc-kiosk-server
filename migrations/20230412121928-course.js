"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable("Courses", {
      id: {
        allowNull: false,
        primaryKey: true,
        autoIncrement: false,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      address: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      coordinates: {
        type: Sequelize.JSON,
        defaultValue: [],
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Courses");
  },
};
