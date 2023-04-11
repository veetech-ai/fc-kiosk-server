"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Transactions", "passport_number", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "foreign_transaction_status", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
        comment: "1=Approved, 2=Rejected, null=no action",
      }),
      queryInterface.addColumn("Transactions", "passport_picture", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "passport_score", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "user_picture", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "user_video", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "liveness_score", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Transactions", "passport_number"),
      queryInterface.removeColumn("Transactions", "foreign_transaction_status"),
      queryInterface.removeColumn("Transactions", "passport_picture"),
      queryInterface.removeColumn("Transactions", "passport_score"),
      queryInterface.removeColumn("Transactions", "user_picture"),
      queryInterface.removeColumn("Transactions", "user_video"),
      queryInterface.removeColumn("Transactions", "liveness_score"),
    ]);
  },
};
