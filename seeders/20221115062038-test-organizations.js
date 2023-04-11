"use strict";

const config = require("../config/config");

module.exports = {
  up: (queryInterface, Sequelize) => {
    if (config.env == "test") {
      return queryInterface.bulkInsert(
        "Organizations",
        [
          {
            name: "Zong",
            description: "Test organization for testing ",
          },
        ],
        {
          updateOnDuplicate: ["name"],
        },
      );
    } else {
      return Promise.resolve();
    }
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Organizations", null, {});
  },
};
