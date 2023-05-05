"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("Screen_Configs", "faq", {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      }),
      queryInterface.addColumn("Screen_Configs", "created_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      }),
      queryInterface.addColumn("Screen_Configs", "updated_at", {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.removeColumn("Screen_Configs", "faq"),
      queryInterface.removeColumn("Screen_Configs", "created_at"),
      queryInterface.removeColumn("Screen_Configs", "updated_at"),
    ]);
  },
};
