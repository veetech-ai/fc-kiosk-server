"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addConstraint("Schedules", {
        type: "unique",
        name: "mqtt_token_unique_constraint",
        fields: ["mqtt_token"],
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeConstraint(
        "Schedules",
        "mqtt_token_unique_constraint",
        {},
      ),
    ]);
  },
};
