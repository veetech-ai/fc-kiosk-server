"use strict";
const { logger } = require("../logger");
module.exports = {
  up: (queryInterface, Sequelize) => {
    try {
      return queryInterface.addColumn("Stations", "nextStations", {
        type: Sequelize.JSON,
        defaultValue: [],
      });
    } catch (err) {
      logger.error(err);
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Stations", "nextStations");
  },
};
