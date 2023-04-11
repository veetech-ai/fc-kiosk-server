"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "User_Device_Schedulings",
        "user_id",
        "orgId",
      ),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn(
        "User_Device_Schedulings",
        "orgId",
        "user_id",
      ),
    ]);
  },
};
