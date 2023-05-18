"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      "Feedbacks", // name of Source model
      "is_addressed", // name of the key we're adding
      {
        type: Sequelize.BOOLEAN,
        allowNull: true,
        defaultValue: false,
      },
    );
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      "Feedbacks", // name of Source model
      "is_addressed", // key we want to remove
    );
  },
};
