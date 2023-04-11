"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("Transactions", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        session_id: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        device_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },

        service: {
          type: Sequelize.STRING,
          allowNull: true,
          default: null,
        },
        success: {
          type: Sequelize.STRING,
          allowNull: true,
          default: null,
        },
        fault: {
          type: Sequelize.STRING,
          allowNull: true,
          default: null,
        },
        feedback: {
          type: Sequelize.DOUBLE,
          allowNull: true,
          default: null,
        },
        time_spent: {
          type: Sequelize.INTEGER,
          allowNull: true,
          default: null,
          comments: "in seconds",
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("current_timestamp"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("current_timestamp"),
        },
      })
      .then(() =>
        queryInterface.addIndex("Transactions", ["session_id", "device_id"]),
      );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Transactions");
  },
};
