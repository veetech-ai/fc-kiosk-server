"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Games", "teeColor", {
        type: Sequelize.STRING,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Games", "teeColor")]);
  },
};
