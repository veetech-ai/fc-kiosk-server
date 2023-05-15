"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Coupons", "orgId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.addColumn("Coupons", "gcId", {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      
      queryInterface.removeColumn('Coupons', 'discount_type'),
      queryInterface.addColumn("Coupons", "discountType", {
        type: Sequelize.ENUM('fixed', 'percentage'),
        defaultValue: "fixed",
        allowNull: false,
        comment: "Coupon discount type. fixed, percentage. default is fixed",
      }),
      
      queryInterface.renameColumn('Coupons', 'max_use_limit', 'maxUseLimit'),
      queryInterface.renameColumn('Coupons', 'used_by', 'usedBy'),
      
      
      queryInterface.removeColumn('Coupons', 'coupon_for'),
      queryInterface.removeColumn('Coupons', 'users'),
      queryInterface.removeColumn('Coupons', 'device_types')

    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Coupons", "orgId"),
      queryInterface.removeColumn("Coupons", "gcId"),
      queryInterface.removeColumn("Coupons", "discountType"),


      queryInterface.addColumn("Coupons", "discount_type", {
        type: Sequelize.INTEGER,
        defaultValue: 0,
        allowNull: false,
        comment: "Coupon discount type. 0=fixed, 1=percentage. default is 0",
      }),

      queryInterface.renameColumn('Coupons', 'maxUseLimit', 'max_use_limit'),
      queryInterface.renameColumn('Coupons', 'usedBy', 'used_by'),

      queryInterface.addColumn("Coupons", "coupon_for", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment:
          "Specify that this coupon is for users or device type. default value is 0. 0=users, 1=device_type",
      }),
      queryInterface.addColumn("Coupons", "users", {
        type: Sequelize.STRING,
        allowNull: true,
        comment:
          "Coupon for specific user. contianer commma separated user IDs. default value is null, means for all users",
      }),
      queryInterface.addColumn("Coupons", "device_types", {
        type: Sequelize.STRING,
        allowNull: true,
        comment:
          "Coupon for specific device type. contianer commma separated device type IDs. default value is null, means for all device type",
      }),
    ]);
  },
};
