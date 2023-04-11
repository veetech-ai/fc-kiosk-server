"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("User_Device_Groups", "schedule_id", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("User_Device_Groups", "schedule_id"),
    ]);
  },
};
