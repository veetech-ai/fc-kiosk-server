'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Delete the "old_table" table from the database
    await queryInterface.dropTable('Country_States');
  },

  down: async (queryInterface, Sequelize) => {
    // Recreate the "old_table" table in the database
    await queryInterface.createTable('Country_States', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  }
};
