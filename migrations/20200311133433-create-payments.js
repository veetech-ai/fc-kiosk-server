"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "ID of user how is involve in this payment",
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "ID of device for which payment is need/done",
      },
      receive_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
        comment: "Date of payment transaction done",
      },
      type: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:
          "Type of payment. e.g One time fixed payment OR recurring payment. default is 0. 0=one time, 1=recurring",
      },
      amount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
        comment: "Total payment amount",
      },
      status: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: "Status of payment.",
      },
      coupon_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: "Coupon description",
      },
      user_card_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: "Coupon description",
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
    return queryInterface.dropTable("Payments");
  },
};
