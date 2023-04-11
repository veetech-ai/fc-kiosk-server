const { logger } = require("../logger");

module.exports = {
  up: (queryInterface, Sequelize) => {
    try {
      return Promise.all([
        queryInterface.addColumn("Barcodes", "rework", {
          type: Sequelize.INTEGER,
          defaultValue: 0,
        }),
        queryInterface.addColumn("Barcodes", "lastStationId", {
          type: Sequelize.INTEGER,
          defaultValue: null,
        }),
        queryInterface.addColumn("Barcodes", "status", {
          type: Sequelize.INTEGER,
          defaultValue: null,
        }),
      ]);
    } catch (err) {
      logger.error(err);
    }
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Barcodes", "rework"),
      queryInterface.removeColumn("Barcodes", "lastStationId"),
      queryInterface.removeColumn("Barcodes", "status"),
    ]);
  },
};
