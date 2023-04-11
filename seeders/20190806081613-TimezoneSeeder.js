"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const timezone_json = require("./timezones.json");
    return queryInterface.bulkInsert("Timezones", timezone_json, {
      updateOnDuplicate: ["area"],
    });
  },

  down: (queryInterface, Sequelize) => {
    // return queryInterface.bulkDelete('Timezones', null, {});
  },
};
