"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint("Configurations", {
        type: "unique",
        name: "id_unique_constraint",
        fields: ["id"],
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint(
        "Configurations",
        "id_unique_constraint",
        {},
      ),
    ]);
  },
};
