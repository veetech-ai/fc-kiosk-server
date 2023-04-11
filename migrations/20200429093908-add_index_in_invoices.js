"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addIndex("Invoices", ["issue_date"], {
        fields: ["issue_date"],
        name: "issue_date_index",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeIndex("Invoices", "issue_date_index"),
    ]);
  },
};
