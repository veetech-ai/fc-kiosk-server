"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("User_Device_Groups", "user_id", "orgId"),
      queryInterface.renameColumn(
        "User_Device_Groups_Items",
        "user_id",
        "orgId",
      ),
      queryInterface.renameColumn(
        "User_Device_Groups_Items",
        "user_device_group_id",
        "organization_device_group_id",
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("User_Device_Groups", "orgId", "user_id"),
      queryInterface.renameColumn(
        "User_Device_Groups_Items",
        "orgId",
        "user_id",
      ),
      queryInterface.renameColumn(
        "User_Device_Groups_Items",
        "organization_device_group_id",
        "user_device_group_id",
      ),
    ]);
  },
};
