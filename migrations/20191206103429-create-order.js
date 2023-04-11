"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Orders", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:
          "0=only add to cart, 1=completed, 2=pending/need review/in progress, 3=cancel by end user, 4=waiting payment, 5=payment done, delivering, 6=rejected",
      },
      payment_method: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment:
          "1=cash on delivery, 2=credit/debit visa card payment, 3=bank transfer/easy paisa/omni etc, 4=paypal",
      },
      payment_info: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: "{}",
      },
      shipping_address: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: "{}",
      },
      voucher: {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: "{}",
      },
      notes: {
        type: Sequelize.TEXT,
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
    return queryInterface.dropTable("Orders");
  },
};
