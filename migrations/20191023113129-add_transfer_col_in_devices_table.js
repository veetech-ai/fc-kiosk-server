"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "transfer", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Devices", "transfer_token", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Devices", "transfer"),
      queryInterface.removeColumn("Devices", "transfer_token"),
    ]);
  },
};
