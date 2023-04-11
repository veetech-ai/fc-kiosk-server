"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Stations", "connectTo");
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Stations", "connectTo", {
      type: Sequelize.INTEGER,
      defaultValue: Sequelize.NULL,
    });
  },
};
