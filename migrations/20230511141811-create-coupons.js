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
        comment: "Coupon expiry date. after this it will be worthless",
      },
      code: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
          isAlphanumeric: true,
        },
        comment: "Coupon code",
      },
      discountType: {
        type: Sequelize.ENUM('fixed', 'percentage'),
        defaultValue: "fixed",
        allowNull: false,
        comment: "Coupon discount type. 0=fixed, 1=percentage. default is 0",
      },
      discount: {
        type: Sequelize.FLOAT,
        allowNull: false,
        comment: "Coupon discount rate",
      },
      maxUseLimit: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment:
          "Coupon maximum use limit. default value is null, means limited user can use it.",
      },
      usedBy: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 0,
        comment:
          "Coupon used by user(s). will tell us that how many users used this token.",
      },
      orgId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      gcId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
