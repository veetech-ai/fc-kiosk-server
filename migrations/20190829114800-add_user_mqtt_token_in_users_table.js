"use strict";

const randtoken = require("rand-token");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn("Users", "mqtt_token", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: randtoken.generate(10),
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("Users", "mqtt_token");
  },
};
