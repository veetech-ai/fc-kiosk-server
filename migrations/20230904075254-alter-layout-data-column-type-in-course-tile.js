"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Course_Tiles", "layoutData", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Course_Tiles", "layoutData", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
