"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Mobile_Courses", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        golfbert_id: {
          allowNull: true,
          type: Sequelize.INTEGER,
          unique: true,
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
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      }),
      await queryInterface.addIndex("Mobile_Courses", ["lat"]),
      await queryInterface.addIndex("Mobile_Courses", ["long"]),
      await queryInterface.addIndex("Mobile_Courses", ["name"]),
      await queryInterface.addIndex("Mobile_Courses", ["golfbert_id"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Mobile_Courses");
  },
};
