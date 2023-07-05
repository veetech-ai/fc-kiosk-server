"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Statistics", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        rounds: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        putt: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        avgGirPercentage: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        bestScore: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        worstScore: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        bestScoreRelativeToPar: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        worstScoreRelativeToPar: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        avg: {
          type: Sequelize.FLOAT,
          allowNull: true,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
          onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
        },
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Statistics");
  },
};
