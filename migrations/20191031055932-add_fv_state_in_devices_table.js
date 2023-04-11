"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "fv_update_state", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
        comment: "1=fail,2=in-progress",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Devices", "fv_update_state"),
    ]);
  },
};
