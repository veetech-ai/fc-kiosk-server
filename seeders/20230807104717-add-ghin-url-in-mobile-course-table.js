"use strict";

const ghinUrl = "https://www.ghin.com/login";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkUpdate("Mobile_Course", { ghinUrl }, {});
  },

  down: async (queryInterface) => {
    // Remove the added data
    await queryInterface.bulkDelete("Mobile_Course", { ghinUrl });
  },
};
