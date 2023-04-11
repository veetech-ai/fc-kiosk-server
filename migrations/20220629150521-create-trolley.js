"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable("Trolleys", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        trolleyId: {
          unique: true,
          type: Sequelize.INTEGER,
        },
        stationId: {
          type: Sequelize.INTEGER,
        },
        lastStationId: {
          type: Sequelize.INTEGER,
        },
        nextStationId: {
          type: Sequelize.INTEGER,
        },
        barcode: {
          type: Sequelize.STRING,
        },
        product: {
          type: Sequelize.STRING,
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
        },
      });
      await queryInterface.addIndex("Trolleys", ["trolleyId", "barcode"]);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Trolleys");
  },
};
