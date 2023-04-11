"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint("Modes", {
        type: "unique",
        name: "value_unique_constraint",
        fields: ["value"],
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint("Modes", "value_unique_constraint", {}),
    ]);
  },
};
