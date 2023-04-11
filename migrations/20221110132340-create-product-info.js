"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Product_Infos", {
      barcode: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING,
      },
      product: {
        type: Sequelize.STRING,
      },
      fiber_count: {
        type: Sequelize.INTEGER,
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
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Product_Infos");
  },
};
