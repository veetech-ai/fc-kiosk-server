"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "device_token", {
        type: Sequelize.TEXT,
        unique: {
          name: "device_token_index",
          index: {
            type: Sequelize.STRING(25550),
          },
        },
        allowNull: false,
      }),
      queryInterface.addColumn("Devices", "is_enabled", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Devices", "device_token"),
      queryInterface.removeColumn("Devices", "is_enabled"),
    ]);
  },
};
