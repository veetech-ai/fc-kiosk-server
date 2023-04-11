"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Device_Diagnostics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      battery_charging: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      battery_charged: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      encoder_miss: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      home_miss: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      h_bridge_fault: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      over_current: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      vbat_alert: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      last_hexa: {
        type: Sequelize.STRING,
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
    return queryInterface.dropTable("Device_Diagnostics");
  },
};
