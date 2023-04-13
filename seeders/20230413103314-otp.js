"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "OTPs",
      [
        {
          phone: "1234567890",
          code: "1234",
          otpCreatedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("OTPs", null, {});
  },
};
