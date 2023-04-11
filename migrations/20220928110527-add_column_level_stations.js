const { logger } = require("../logger");

module.exports = {
  up: (queryInterface, Sequelize) => {
    try {
      return queryInterface.addColumn("Stations", "level", {
        type: Sequelize.INTEGER,
      });
    } catch (error) {
      logger.error(error);
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Stations", "level");
  },
};
