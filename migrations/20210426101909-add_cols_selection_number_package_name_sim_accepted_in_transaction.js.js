"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Transactions", "number_selection", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "sim_accepted", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Transactions", "package_name", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Transactions", "number_selection"),
      queryInterface.removeColumn("Transactions", "sim_accepted"),
      queryInterface.removeColumn("Transactions", "package_name"),
    ]);
  },
};
