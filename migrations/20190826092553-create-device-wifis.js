"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Device_Wifis", {
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
      wifi_ip: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      wifi_ssid: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      current_channel: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      preferred_channel: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
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
    return queryInterface.dropTable("Device_Wifis");
  },
};
