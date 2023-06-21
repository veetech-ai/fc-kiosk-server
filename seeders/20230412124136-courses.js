"use strict";

const { getGolfCourses } = require("../common/golf_courses");
const dataArr = getGolfCourses().map((course) => ({
  ...course,
  golfbert_id: course.id,
  id: undefined, // remove the original id property
}));

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert("Mobile_Courses", dataArr, {
      updateOnDuplicate: [
        "country",
        "street",
        "city",
        "state",
        "zip",
        "name",
        "phone",
        "lat",
        "long",
      ],
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Mobile_Courses", null, {});
  },
};
