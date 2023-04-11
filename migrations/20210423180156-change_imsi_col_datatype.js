"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Transactions", "IMSI", {
        type: Sequelize.STRING(25),
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Transactions", "IMSI", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },
};
