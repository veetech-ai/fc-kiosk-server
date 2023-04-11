"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Order_Items", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      order_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      product_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      quantity: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
      },
      shipping_charges: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      tax: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
      },
      price: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      total: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      addons: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: "{}",
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
    return queryInterface.dropTable("OrderItems");
  },
};
