"use strict";

const ghin_url = "https://www.ghin.com/login";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkUpdate("Courses", { ghin_url }, {});
  },

  down: async (queryInterface) => {
    // Remove the added data
    await queryInterface.bulkDelete("Courses", { ghin_url });
  },
};
