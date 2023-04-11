"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Modes",
      [
        {
          id: 1,
          name: "AUTO",
          value: 0,
        },
        {
          id: 2,
          name: "FAN",
          value: 6,
        },
        {
          id: 3,
          name: "HEAT",
          value: 4,
        },
        {
          id: 4,
          name: "DRY",
          value: 2,
        },
        {
          id: 5,
          name: "COOL",
          value: 1,
        },
      ],
      {
        updateOnDuplicate: ["value"],
      },
    );
  },
  down: (queryInterface, Sequelize) => {},
};
