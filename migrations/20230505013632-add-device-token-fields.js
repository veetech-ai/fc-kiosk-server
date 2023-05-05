"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "device_token", {
        type: Sequelize.TEXT,
        allowNull: false,
      }),
      queryInterface.addColumn("Devices", "is_enable", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Devices", "device_token"),
      queryInterface.removeColumn("Devices", "is_enable"),
    ]);
  },
};
