"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("User_Device_settings", "user_id", "orgId"),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("User_Device_settings", "orgId", "user_id"),
    ]);
  },
};
