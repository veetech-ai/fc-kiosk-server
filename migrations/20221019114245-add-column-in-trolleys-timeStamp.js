const { logger } = require("../logger");

module.exports = {
  up: (queryInterface, Sequelize) => {
    try {
      return Promise.all([
        queryInterface.addColumn("Trolleys", "tsm", {
          type: Sequelize.DATE,
        }),
      ]);
    } catch (err) {
      logger.error(err);
    }
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Trolleys", "tsm")]);
  },
};
