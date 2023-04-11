"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Payments", "amount"),
      queryInterface.removeColumn("Payments", "type"),
      queryInterface.addColumn("Payments", "one_time_amount", {
        type: Sequelize.DOUBLE,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Payments", "invoice_id", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Payments", "invoice_total", {
        type: Sequelize.DOUBLE,
        defaultValue: null,
        allowNull: true,
      }),
      queryInterface.addColumn("Payments", "payment_option_id", {
        type: Sequelize.INTEGER,
        defaultValue: null,
        allowNull: true,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Payments", "one_time_amount"),
      queryInterface.removeColumn("Payments", "invoice_id"),
      queryInterface.removeColumn("Payments", "invoice_total"),
      queryInterface.removeColumn("Payments", "payment_option_id"),
      queryInterface.addColumn("Payments", "amount", {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: "Total payment amount",
      }),
      queryInterface.addColumn("Payments", "type", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:
          "Type of payment. e.g One time fixed payment OR recurring payment. default is 0. 0=one time, 1=recurring",
      }),
    ]);
  },
};
