"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    const data_arr = [
      {
        title: "2Checkout",
        description: "2Checkout",
      },
      {
        title: "Skrill",
        description: "Skrill",
      },
      {
        title: "PayPal",
        description: "PayPal",
      },
      {
        title: "Stripe",
        description: "Stripe",
      },
      {
        title: "JazzCash",
        description: "JazzCash",
      },
      {
        title: "EasyPaisa",
        description: "EasyPaisa",
      },
      {
        title: "HBL",
        description: "HBL",
      },
      {
        title: "UBL",
        description: "UBL",
      },
      {
        title: "MCB",
        description: "MCB",
      },
      {
        title: "Alfalah",
        description: "Alfalah",
      },
      {
        title: "Cash On Delivery",
        description: "Cash on Delivery",
      },
    ];

    return queryInterface.bulkInsert("Payment_Options", data_arr, {
      updateOnDuplicate: ["title"],
    });
  },

  down: (queryInterface, Sequelize) => {
    /*
      Add reverting commands here.
      Return a promise to correctly handle asynchronicity.

      Example:
      return queryInterface.bulkDelete('People', null, {});
    */
  },
};
