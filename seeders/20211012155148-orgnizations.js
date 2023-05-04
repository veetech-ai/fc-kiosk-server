"use strict";

const { organizationsData } = require("../common/organizations.data");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Organizations", organizationsData, {
      updateOnDuplicate: ["name"],
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Organizations", null, {});
  },
};
