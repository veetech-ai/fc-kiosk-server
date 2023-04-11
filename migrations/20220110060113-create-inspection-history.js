"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("InspectionHistories", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      date: {
        allowNull: false,
        unique: true,
        type: Sequelize.DATE,
      },
      serialNo: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      stationSerialNo: {
        allowNull: false,
        type: Sequelize.STRING,
      },
      globalPass: {
        type: Sequelize.BOOLEAN,
      },
      sampleName: {
        type: Sequelize.STRING,
      },
      operator: {
        type: Sequelize.STRING,
      },
      data: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable("InspectionHistories");
  },
};
