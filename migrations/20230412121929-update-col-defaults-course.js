"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.changeColumn("Courses", "lat", {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "long", {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "par", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "yards", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "holes", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "slope", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "content", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "images", {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "year_built", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      await queryInterface.changeColumn("Courses", "org_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        defaultValue: null,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.changeColumn("Courses", "lat", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      }),
      await queryInterface.changeColumn("Courses", "long", {
        type: Sequelize.DOUBLE,
        allowNull: true,
      }),
      await queryInterface.changeColumn("Courses", "par", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "yards", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "holes", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "slope", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "content", {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "images", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "year_built", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      }),
      await queryInterface.changeColumn("Courses", "org_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
    ]);
  },
};
