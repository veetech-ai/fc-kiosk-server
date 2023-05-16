"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Coupon_Useds", "gcId", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.changeColumn("Coupon_Useds", "gcId", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
  },
};
