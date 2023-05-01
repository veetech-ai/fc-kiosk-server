"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.removeColumn("Courses", "display_name");
    await queryInterface.removeColumn("Courses", "display_state");
    await queryInterface.removeColumn("Courses", "display_city");
    await queryInterface.removeColumn("Courses", "display_zip");
    await queryInterface.removeColumn("Courses", "display_phone");
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn("Courses", "display_name", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "golf course name besides name coming from golfbert",
    });
    await queryInterface.addColumn("Courses", "display_state", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "golf course state besides state coming from golfbert",
    });
    await queryInterface.addColumn("Courses", "display_city", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "golf course city besides city coming from golfbert",
    });
    await queryInterface.addColumn("Courses", "display_zip", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "golf course zip besides zip coming from golfbert",
    });
    await queryInterface.addColumn("Courses", "display_phone", {
      type: Sequelize.STRING,
      allowNull: true,
      comment: "golf course phone besides phone coming from golfbert",
    });
    await queryInterface.addIndex("Courses", ["display_name"]);
  },
};
