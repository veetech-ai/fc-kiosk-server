"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Courses", {
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
        par: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        yards: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        holes: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        logo: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        slope: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        content: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: 0,
        },
        images: {
          type: Sequelize.JSON,
          allowNull: false,
          defaultValue: "[]",
        },
        year_built: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
        architects: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        greens: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        fairways: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        members: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        season: {
          type: Sequelize.STRING,
          allowNull: true,
          defaultValue: null,
        },
        org_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: {
            model: "Organizations",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      }),
      await queryInterface.addIndex("Courses", ["lat"]),
      await queryInterface.addIndex("Courses", ["long"]),
      await queryInterface.addIndex("Courses", ["name"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Courses");
  },
};
