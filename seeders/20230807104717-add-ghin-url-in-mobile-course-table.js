"use strict";

const ghin_url = "https://www.ghin.com/login";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface) => {
    await queryInterface.bulkUpdate("Mobile_Courses", { ghin_url }, {});
  },

  down: async (queryInterface) => {
    // Remove the added data
    await queryInterface.bulkDelete("Mobile_Courses", { ghin_url });
  },
};
