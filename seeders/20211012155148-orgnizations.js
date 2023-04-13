"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Organizations",
      [
        {
          name: "Test",
          description: "Test organization for testing ",
        },
        {
          name: "cowlar",
          description: "Test organization for testing ",
        },
        {
          name: "digitalfairqays",
          description: "digitalfairqays for testing ",
        },
      ],
      {
        updateOnDuplicate: ["name"],
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Organizations", null, {});
  },
};
