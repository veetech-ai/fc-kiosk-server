"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addIndex("Payments", ["receive_date"], {
        fields: ["receive_date"],
        name: "receive_date_index",
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeIndex("Payments", "receive_date_index"),
    ]);
  },
};
