"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Mobile_Course", "ghinUrl", {
      type: Sequelize.STRING,
      allowNull: true,
      before: "createdAt",
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Mobile_Course", "ghinUrl");
  },
};
