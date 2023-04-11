"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Device_Networks", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "device id, which have this wifi",
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "user id, who add wifi",
      },
      ssid: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "wifi name",
      },
      password: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "wifi password",
      },
      priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "wifi order priority",
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
        comment: "record status, 1=active, 0=not active",
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
    return queryInterface.dropTable("Device_Networks");
  },
};
