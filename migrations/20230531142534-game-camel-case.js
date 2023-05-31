"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("Games","mc_id","mcId"),
      queryInterface.renameColumn("Games","org_id","orgId"),
      queryInterface.renameColumn("Games","owner_id","ownerId"),
      queryInterface.renameColumn("Games","participant_id","participantId"),
      queryInterface.renameColumn("Games","participant_name","participantName"),
      queryInterface.renameColumn("Games","start_time","startTime"),
      queryInterface.renameColumn("Games","end_time","endTime"),
      queryInterface.renameColumn("Games","total_shots_taken","totalShotsTaken"),
      queryInterface.renameColumn("Games","total_ideal_shots","totalIdealShots"),
      queryInterface.renameColumn("Games","tee_color","teeColor"),
      queryInterface.renameColumn("Games","game_id","gameId"),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.renameColumn("Games","mcId","mc_id"),
      queryInterface.renameColumn("Games","orgId","org_id"),
      queryInterface.renameColumn("Games","ownerId","owner_id"),
      queryInterface.renameColumn("Games","participantId","participant_id"),
      queryInterface.renameColumn("Games","participantName","participant_name"),
      queryInterface.renameColumn("Games","startTime","start_time"),
      queryInterface.renameColumn("Games","endTime","end_time"),
      queryInterface.renameColumn("Games","totalShotsTaken","total_shots_taken"),
      queryInterface.renameColumn("Games","totalIdealShots","total_ideal_shots"),
      queryInterface.renameColumn("Games","teeColor","tee_color"),
      queryInterface.renameColumn("Games","gameId","game_id"),
    ]);
  },
};