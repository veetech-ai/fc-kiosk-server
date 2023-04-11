"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("InspectionHistories", "serialNo", {
        type: Sequelize.INTEGER,
      }),
      queryInterface.changeColumn("InspectionHistories", "globalPass", {
        type: Sequelize.ENUM("fail", "pass", "unknown"),
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("InspectionHistories", "serialNo"),
      queryInterface.changeColumn("InspectionHistories", "globalPass"),
    ]);
  },
};
