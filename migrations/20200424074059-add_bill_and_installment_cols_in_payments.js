"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Payments", "bill_amount", {
        type: Sequelize.DOUBLE,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Payments", "installment_amount", {
        type: Sequelize.DOUBLE,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Payments", "bill_amount"),
      queryInterface.removeColumn("Payments", "installment_amount"),
    ]);
  },
};
