"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "enable_bill", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Devices", "bill_cleared", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      }),
      queryInterface.addColumn("Devices", "grace_period", {
        type: Sequelize.INTEGER,
        defaultValue: 7,
        allowNull: false,
      }),
      queryInterface.addColumn("Devices", "trial_period", {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Devices", "enable_bill"),
      queryInterface.removeColumn("Devices", "bill_cleared"),
      queryInterface.removeColumn("Devices", "grace_period"),
      queryInterface.removeColumn("Devices", "trial_period"),
    ]);
  },
};
