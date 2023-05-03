"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Roles", "get_courses", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
      queryInterface.addColumn("Roles", "manage_courses", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Roles", "get_courses"),
      queryInterface.removeColumn("Roles", "manage_courses"),
    ]);
  },
};
