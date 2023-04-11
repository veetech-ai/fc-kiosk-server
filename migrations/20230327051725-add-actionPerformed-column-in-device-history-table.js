"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Device_Histories", "performed_actions_keys", {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: "[]",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Device_Histories", "performed_actions_keys"),
    ]);
  },
};
