"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Tiles", "type", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    // Populate the type column with the same value as the name column
    await queryInterface.sequelize.query(`
      UPDATE \`Tiles\`
      SET \`type\` = \`name\`
    `);

    return;
  },

  down: async (queryInterface) => {
    return await queryInterface.removeColumn("Tiles", "type");
  },
};
