"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.renameTable('Contact_Coach', 'Contact_Coaches');
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.renameTable('Contact_Coaches', 'Contact_Coach');
  },
};
