"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Stations", "operatorId", {
        type: Sequelize.INTEGER,
        defaultValue: null,
      }),
      queryInterface.addColumn("Stations", "operatorName", {
        type: Sequelize.STRING,
        defaultValue: null,
      }),
      queryInterface.addColumn("Stations", "operatorLoginTime", {
        type: Sequelize.DATE,
        defaultValue: null,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Stations", "operatorId"),
      queryInterface.removeColumn("Stations", "operatorName"),
      queryInterface.removeColumn("Stations", "operatorLoginTime"),
    ]);
  },
};
