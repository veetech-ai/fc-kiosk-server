'use strict';

const { getGolfCourses } = require('../common/golf_courses');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const dataArr = getGolfCourses();
    await queryInterface.bulkInsert('Courses', dataArr, {
      updateOnDuplicate: ['lat', 'long'],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Courses', null, {});
  },
};