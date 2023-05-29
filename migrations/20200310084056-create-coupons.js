"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Coupons", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Coupon title",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
        comment: "Coupon description",
      },
      expiry: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Coupon expiry date. after this it will worthless",
      },
      code: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Coupon code",
      },
      discount_type: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Coupon discount type. 0=fixed, 1=percentage. default is 0",
      },
      discount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Coupon discount rate",
      },
      max_use_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment:
          "Coupon maximum use limit. default value is null, means limited user can use it.",
      },
      used_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment:
          "Coupon used by user(s). will tell us that how many users used this token.",
      },
      coupon_for: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:
          "Specify that this coupon is for users or device type. default value is 0. 0=users, 1=device_type",
      },
      users: {
        type: Sequelize.STRING,
        allowNull: true,
        comment:
          "Coupon for specific user. contianer commma separated user IDs. default value is null, means for all users",
      },
      device_types: {
        type: Sequelize.STRING,
        allowNull: true,
        comment:
          "Coupon for specific device type. contianer commma separated device type IDs. default value is null, means for all device type",
      },
      status: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
        comment: "Coupon status",
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
    return queryInterface.dropTable("Coupons");
  },
};
