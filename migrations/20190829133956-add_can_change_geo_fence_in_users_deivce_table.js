"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("User_Devices", "can_change_geo_fence", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.addColumn("User_Devices", "can_change_scheduling", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("User_Devices", "can_change_geo_fence"),
      queryInterface.removeColumn("User_Devices", "can_change_scheduling"),
    ]);
  },
};
