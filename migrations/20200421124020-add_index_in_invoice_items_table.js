"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addIndex("Invoice_Items", ["issue_date"], {
        fields: ["issue_date"],
        name: "issue_date_index",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeIndex("Invoice_Items", "issue_date_index"),
    ]);
  },
};
