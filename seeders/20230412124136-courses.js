"use strict";

const { getGolfCourses } = require("../common/golf_courses");

module.exports = {
  up: (queryInterface, Sequelize) => {
    const data_arr = getGolfCourses();
    return queryInterface.bulkInsert("Courses", data_arr , { ignoreDuplicates: true }, );
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
};
