"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.addColumn("User_Game_Invitations", "gcId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.addColumn("User_Game_Invitations", "gameStartTime", {
        type: Sequelize.DATE,
        allowNull: false,
      }),
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return await Promise.all([
      queryInterface.removeColumn("User_Game_Invitations", "gcId"),
      queryInterface.removeColumn("User_Game_Invitations", "gameStartTime"),
    ]);
  },
};
