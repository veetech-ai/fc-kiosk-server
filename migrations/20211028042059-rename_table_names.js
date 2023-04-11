"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable(
        "User_Device_settings",
        "Organization_Device_settings",
      ),
      queryInterface.renameTable(
        "User_Device_Groups",
        "Organization_Device_Groups",
      ),
      queryInterface.renameTable(
        "User_Device_Groups_Items",
        "Organization_Device_Groups_Items",
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameTable(
        "Organization_Device_settings",
        "User_Device_settings",
      ),
      queryInterface.renameTable(
        "Organization_Device_Groups",
        "User_Device_Groups",
      ),
      queryInterface.renameTable(
        "Organization_Device_Groups_Items",
        "User_Device_Groups_Items",
      ),
    ]);
  },
};
