"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("User_Devices", "share_by", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.addColumn("User_Devices", "can_share", {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      }),
      queryInterface.addColumn("User_Devices", "remote_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      }),
      queryInterface.addColumn("User_Devices", "share_verify_token", {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("User_Devices", "share_by"),
      queryInterface.removeColumn("User_Devices", "can_share"),
      queryInterface.removeColumn("User_Devices", "remote_id"),
      queryInterface.removeColumn("User_Devices", "share_verify_token"),
    ]);
  },
};
