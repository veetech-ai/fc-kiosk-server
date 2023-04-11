"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint("Products", {
        type: "unique",
        name: "id_unique_constraint",
        fields: ["id"],
      }),
      queryInterface.addColumn("Products", "one_time_payment", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        allowNull: false,
        comment: "One time payment active or not",
        fields: ["one_time_payment"],
      }),

      queryInterface.addColumn("Products", "subscription", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Subscription active or not",
        fields: ["subscription"],
      }),
      queryInterface.addColumn("Products", "subscription_price", {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        allowNull: true,
        fields: ["subscription_price"],
      }),

      queryInterface.addColumn("Products", "installments", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        comment: "Installments active or not",
        fields: ["installments"],
      }),
      queryInterface.addColumn("Products", "installment_total_price", {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        allowNull: true,
        fields: ["installment_total_price"],
      }),
      queryInterface.addColumn("Products", "installment_per_month_price", {
        type: Sequelize.DOUBLE,
        defaultValue: 0,
        allowNull: true,
        fields: ["installment_per_month_price"],
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint("Products", "id_unique_constraint", {}),
      queryInterface.removeColumn("Products", "one_time_payment"),
      queryInterface.removeColumn("Products", "subscription"),
      queryInterface.removeColumn("Products", "subscription_price"),
      queryInterface.removeColumn("Products", "installments"),
      queryInterface.removeColumn("Products", "installment_total_price"),
      queryInterface.removeColumn("Products", "installment_per_month_price"),
    ]);
  },
};
