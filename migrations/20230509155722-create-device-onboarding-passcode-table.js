"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Device_Onboarding_Codes", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        code: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      }),
      await queryInterface.addIndex("Device_Onboarding_Codes", ["code"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Device_Onboarding_Codes");
  },
};
