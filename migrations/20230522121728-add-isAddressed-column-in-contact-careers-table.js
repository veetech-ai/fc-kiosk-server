"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return await queryInterface.addColumn("Contact_Careers", "isAddressed", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return await queryInterface.removeColumn(
      "Contact_Careers",
      "isAddressed",
    );
  },
};
