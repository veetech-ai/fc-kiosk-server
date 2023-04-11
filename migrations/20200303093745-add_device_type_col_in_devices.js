"use strict";
const settings = require("../config/settings");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "device_type", {
        type: Sequelize.INTEGER,
        defaultValue: settings.get("default_device_type"),
        allowNull: false,
        comment: "1=autma, 2=geyser, 3=solar for now",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Devices", "device_type")]);
  },
};
