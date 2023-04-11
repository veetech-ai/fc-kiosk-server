"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable("Stations", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        stationId: {
          type: Sequelize.INTEGER,
          unique: true,
        },
        name: {
          type: Sequelize.STRING,
        },
        posx: {
          type: Sequelize.INTEGER,
        },
        posy: {
          type: Sequelize.INTEGER,
        },
        connectTo: {
          type: Sequelize.INTEGER,
        },
        other: {
          type: Sequelize.JSON,
        },
        trolleyIds: {
          type: Sequelize.JSON,
        },
        barcode: {
          type: Sequelize.STRING,
        },
        enterTsm: {
          type: Sequelize.DATE,
        },
        leaveTsm: {
          type: Sequelize.DATE,
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
      await queryInterface.addIndex("Stations", ["stationId", "barcode"]);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Stations");
  },
};
