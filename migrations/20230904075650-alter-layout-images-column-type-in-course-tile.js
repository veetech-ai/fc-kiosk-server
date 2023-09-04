"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Course_Tiles", "layoutImages", {
      type: Sequelize.TEXT("medium"),
      allowNull: true,
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("Course_Tiles", "layoutImages", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },
};
