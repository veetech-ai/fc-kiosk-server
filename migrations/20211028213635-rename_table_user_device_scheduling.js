"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable(
        "User_Device_Schedulings",
        "Organization_Device_Schedulings",
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable(
        "Organization_Device_Schedulings",
        "User_Device_Schedulings",
      ),
    ]);
  },
};
