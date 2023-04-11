"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn("Schedules", "user_id", "orgId");
    await queryInterface.changeColumn("Schedules", "orgId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    return;
  },

  down: async (queryInterface) => {},
};
