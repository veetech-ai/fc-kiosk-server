"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.renameColumn("Holes","g_id","gId"),
      queryInterface.renameColumn("Holes","mc_id","mcId"),
      queryInterface.renameColumn("Holes","user_id","userId"),
      queryInterface.renameColumn("Holes","tracked_shots","trackedShots"),
      queryInterface.renameColumn("Holes","no_of_shots","noOfShots"),
      queryInterface.renameColumn("Holes","hole_id","holeId"),
      queryInterface.renameColumn("Holes","hole_number","holeNumber"),
      queryInterface.renameColumn("Holes","is_gir","isGir"),
      queryInterface.renameColumn("Holes","shots_from_green","shotsFromGreen"),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.renameColumn("Holes","gId","g_id"),
      queryInterface.renameColumn("Holes","mcId","mc_id"),
      queryInterface.renameColumn("Holes","userId","user_id"),
      queryInterface.renameColumn("Holes","trackedShots","tracked_shots"),
      queryInterface.renameColumn("Holes","noOfShots","no_of_shots"),
      queryInterface.renameColumn("Holes","holeId","hole_id"),
      queryInterface.renameColumn("Holes","holeNumber","hole_number"),
      queryInterface.renameColumn("Holes","isGir","is_gir"),
      queryInterface.renameColumn("Holes","shotsFromGreen","shots_from_green")
    ]);
  },
};