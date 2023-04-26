'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "handicap_index", {
      type: Sequelize.FLOAT,
      allowNull: true,
    });
    await queryInterface.changeColumn("Users", "gender", {
      type: Sequelize.STRING,
      allowNull: true,
    });   
    await queryInterface.changeColumn("Users", "date_of_birth", {
      type: Sequelize.DATEONLY,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn("Users", "handicap_index", {
      type: Sequelize.STRING,
      allowNull: false,
    }),
    await queryInterface.changeColumn("Users", "gender", {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn("Users", "date_of_birth", {
      type: Sequelize.DATEONLY,
      allowNull: false,
    });
  }
};