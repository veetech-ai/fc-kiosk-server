"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Devices", "parent", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "0, if device have no parent",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Devices", "parent")]);
  },
};
