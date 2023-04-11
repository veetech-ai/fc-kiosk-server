"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Products", "grace_period", {
        type: Sequelize.INTEGER,
        defaultValue: 7,
        allowNull: false,
      }),
      queryInterface.addColumn("Products", "trial_period", {
        type: Sequelize.INTEGER,
        defaultValue: 30,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Products", "grace_period"),
      queryInterface.removeColumn("Products", "trial_period"),
    ]);
  },
};
