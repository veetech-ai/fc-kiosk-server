"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Fv_Reports", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      fv: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      devices: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      resets: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      runt: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
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
    return queryInterface.dropTable("Fv_Reports");
  },
};
