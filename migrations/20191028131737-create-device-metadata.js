"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Device_Metadata", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      device_id: {
        type: Sequelize.INTEGER,
      },
      fv: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      key: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      value: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      source: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: "1=mqqt,2=slack",
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
    return queryInterface.dropTable("Device_Metadata");
  },
};
