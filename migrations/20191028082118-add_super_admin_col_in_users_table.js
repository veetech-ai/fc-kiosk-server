"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "super_admin", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.changeColumn("Users", "email", {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Users", "super_admin"),
      queryInterface.changeColumn("Users", "email", {
        type: Sequelize.STRING,
        allowNull: false,
        unique: false,
      }),
    ]);
  },
};
