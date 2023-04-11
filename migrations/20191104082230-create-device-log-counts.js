"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Device_Log_Counts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      device_id: {
        type: Sequelize.INTEGER,
      },
      v0_lp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      v0_hp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      v0_info: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      vp_lp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      vp_hp: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      vp_info: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Device_Log_Counts");
  },
};
