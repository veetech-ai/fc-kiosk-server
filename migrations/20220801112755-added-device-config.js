"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    /*
      Add altering commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.createTable('users', { id: Sequelize.INTEGER });
    */
    return Promise.all([
      queryInterface.addColumn(
        "Organization_Device_settings",
        "currentConfig",
        { type: Sequelize.JSON, defaultValue: false },
      ),
      queryInterface.addColumn(
        "Organization_Device_settings",
        "updatedConfig",
        { type: Sequelize.JSON, defaultValue: false },
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.dropTable('users');
    */
    return Promise.all([
      queryInterface.removeColumn(
        "Organization_Device_settings",
        "currentConfig",
      ),
      queryInterface.removeColumn(
        "Organization_Device_settings",
        "updatedConfig",
      ),
    ]);
  },
};
