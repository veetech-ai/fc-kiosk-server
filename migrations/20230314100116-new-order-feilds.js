"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Orders", "name", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Orders", "email", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.addColumn("Orders", "contactNumber", {
        type: Sequelize.INTEGER,
        allowNull: true,
      }),
      queryInterface.addColumn("Orders", "billingAddress", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Orders", "name"),
      queryInterface.removeColumn("Orders", "email"),
      queryInterface.removeColumn("Orders", "contactNumber"),
      queryInterface.removeColumn("Orders", "billingAddress"),
    ]);
  },
};
