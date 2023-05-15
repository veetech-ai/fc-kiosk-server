"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn('Coupon_Useds', 'user_id'),
      queryInterface.removeColumn("Coupon_Useds", "coupon_id"),
      queryInterface.addColumn("Coupon_Useds", "couponId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Coupons",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),

      queryInterface.addColumn("Coupon_Useds", "gcId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),

      queryInterface.addColumn("Coupon_Useds", "deviceId", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),

    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Coupon_Useds", "user_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),
      queryInterface.addColumn("Coupon_Useds", "coupon_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
      }),

      queryInterface.removeColumn("Coupon_Useds", "couponId"),
      queryInterface.removeColumn("Coupon_Useds", "gcId"),
      queryInterface.removeColumn("Coupon_Useds", "deviceId"),


    ]);
  },
};
