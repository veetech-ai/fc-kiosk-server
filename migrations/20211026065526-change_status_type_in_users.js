"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Users", "status", {
        type: Sequelize.INTEGER,
        validate: {
          min: 0,
          max: 2,
        },
        defaultValue: 0,
        allowNull: false,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn("Users", "status", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      }),
    ]);
  },
};
