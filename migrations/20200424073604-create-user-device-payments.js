"use strict";
const settings = require("../config/settings");

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("User_Device_Payments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: "Device owner",
      },
      device_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      device_type: {
        type: Sequelize.INTEGER,
        defaultValue: settings.get("default_device_type"),
        allowNull: false,
        comment:
          "1=autma, 2=geyser, 3=solar, 4=motor, 5=tank, 6=motor and tank, 7=enery audit OR also can be comma separated values like, 1,2,5,6 etc",
      },
      bill: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      otp: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: 0,
        comment: "OPT - One time payment",
      },
      installments: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      installment_total_price: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      installment_per_month_price: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      subscription: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      subscription_price: {
        type: Sequelize.DOUBLE,
        allowNull: true,
        defaultValue: null,
      },
      billexpiry: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      billpaid: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
      },
      reg_date: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("NOW()"),
      },
      grace_period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: settings.get("default_grace_period"),
      },
      trial_period: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: settings.get("default_trial_period"),
      },
      trial_ended: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      next_bill_date: {
        type: Sequelize.DATEONLY,
        defaultValue: null,
        allowNull: true,
        comment: "Upcoming billing date",
      },
      status: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
        allowNull: false,
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
    return queryInterface.dropTable("User_Device_Payments");
  },
};
