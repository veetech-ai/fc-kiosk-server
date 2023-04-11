"use strict";
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.createTable("Barcodes", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        barcode: {
          type: Sequelize.STRING,
          unique: true,
        },
        stationId: {
          type: Sequelize.INTEGER,
        },
        startTime: {
          type: Sequelize.DATE,
        },
        trolleyId: {
          type: Sequelize.INTEGER,
        },
        product: {
          type: Sequelize.STRING,
        },
        endTime: {
          type: Sequelize.DATE,
        },
        journey: {
          type: Sequelize.JSON,
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
      await queryInterface.addIndex("Barcodes", ["barcode"]);
      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Barcodes");
  },
};
