"use strict";

const screenNames = [
  { name: "Course Info", builtIn: true },
  { name: "Coupons", builtIn: true },
  { name: "Lessons", builtIn: true },
  { name: "Memberships", builtIn: true },
  { name: "Feedback", builtIn: true },
  { name: "Careers", builtIn: true },
  { name: "Shop", builtIn: true },
  { name: "Rent A Cart", builtIn: true },
  { name: "Ghin App", builtIn: true },
  { name: "Wedding Event", builtIn: true },
  { name: "FAQs", builtIn: true },
];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    await queryInterface.bulkInsert("Tiles", screenNames);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Tiles", { name: screenNames });
  },
};
