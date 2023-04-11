"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint("Organizations", {
        type: "unique",
        name: "name_unique_constraint",
        fields: ["name"],
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint(
        "Organizations",
        "name_unique_constraint",
        {},
      ),
    ]);
  },
};
