"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Courses", "par", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "yards", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "holes", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "logo", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "slope", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "content", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "images", {
      type: Sequelize.JSON,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "year_built", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "architect", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "greens", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "fairways", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "members", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "season", {
      type: Sequelize.STRING,
      allowNull: false,
    });

    await queryInterface.addColumn("Courses", "tabs_visibility", {
      type: Sequelize.JSON,
      allowNull: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Courses", "par");

    await queryInterface.removeColumn("Courses", "yards");

    await queryInterface.removeColumn("Courses", "holes");
    await queryInterface.removeColumn("Courses", "logo");
    await queryInterface.removeColumn("Courses", "slope");

    await queryInterface.removeColumn("Courses", "content");
    await queryInterface.removeColumn("Courses", "images");
    await queryInterface.removeColumn("Courses", "year_built");
    await queryInterface.removeColumn("Courses", "architect");
    await queryInterface.removeColumn("Courses", "greens");
    await queryInterface.removeColumn("Courses", "fairways");
    await queryInterface.removeColumn("Courses", "members");
    await queryInterface.removeColumn("Courses", "season");
    await queryInterface.removeColumn("Courses", "tabs_visibility");
  },
};
