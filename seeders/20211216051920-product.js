"use strict";

const { getProducts } = require("../common/products");

module.exports = {
  up: (queryInterface, Sequelize) => {
    const data_arr = getProducts();
    return queryInterface.bulkInsert("Products", data_arr, {
      updateOnDuplicate: ["title", "description", "one_time_payment", "price"],
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
