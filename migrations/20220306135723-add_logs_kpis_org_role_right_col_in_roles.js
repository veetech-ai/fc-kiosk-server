"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Roles", "get_logs", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Roles", "manage_logs", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Roles", "get_kpis", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Roles", "manage_kpis", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Roles", "get_organization", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Roles", "manage_organization", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Roles", "get_logs"),
      queryInterface.removeColumn("Roles", "manage_logs"),
      queryInterface.removeColumn("Roles", "get_kpis"),
      queryInterface.removeColumn("Roles", "manage_kpis"),
      queryInterface.removeColumn("Roles", "get_organization"),
      queryInterface.removeColumn("Roles", "manage_organization"),
    ]);
  },
};
