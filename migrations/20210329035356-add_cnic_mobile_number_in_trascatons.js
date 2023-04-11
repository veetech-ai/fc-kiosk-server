"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Transactions", "cnic", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "mobile_number", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.renameColumn("Transactions", "success", "status"),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Transactions", "cnic"),
      queryInterface.removeColumn("Transactions", "mobile_number"),
      queryInterface.renameColumn("Transactions", "status", "success"),
    ]);
  },
};
