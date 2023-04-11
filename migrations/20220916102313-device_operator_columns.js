"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "operatorId", {
        type: Sequelize.INTEGER,
        defaultValue: null,
      }),
      queryInterface.addColumn("Devices", "operatorName", {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
      queryInterface.addColumn("Devices", "operatorLoginTime", {
        type: Sequelize.DATE,
        defaultValue: null,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Devices", "operatorId"),
      queryInterface.removeColumn("Devices", "operatorName"),
      queryInterface.removeColumn("Devices", "operatorLoginTime"),
    ]);
  },
};
