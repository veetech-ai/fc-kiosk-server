"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface
      .createTable("Transaction_Logs", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        session_id: {
          type: Sequelize.STRING,
          allowNull: false,
        },
        device_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        data: {
          type: Sequelize.JSON,
          allowNull: true,
          defaultValue: null,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("NOW()"),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal("NOW()"),
        },
      })
      .then(() =>
        queryInterface.addIndex("Transaction_Logs", [
          "session_id",
          "device_id",
          "type",
        ]),
      );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Transaction_Logs");
  },
};
