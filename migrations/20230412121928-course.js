"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable("Courses", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      street: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      state: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      zip: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      lat: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
      long: {
        type: Sequelize.DOUBLE,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Courses");
  },
};
