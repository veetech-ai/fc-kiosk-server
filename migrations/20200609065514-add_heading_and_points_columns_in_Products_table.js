"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Products", "heading", {
        type: Sequelize.STRING,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Products", "points", {
        type: Sequelize.JSON,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Products", "heading"),
      queryInterface.removeColumn("Products", "points"),
    ]);
  },
};
