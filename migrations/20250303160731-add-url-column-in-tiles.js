"use strict";

const { Tile } = require("../models"); // Assuming Tile is defined in models
const { Op } = require("sequelize");

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Tiles", "url", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    const ghin_url = "https://www.ghin.com/login";
    // Populate the url column for Ghin App tiles, with ghin_url
    await Tile.update(
      { url: ghin_url },
      {
        where: {
          [Op.or]: [
            { type: "Ghin App" },
            {
              [Op.and]: [{ type: "webApp" }, { name: "Ghin App" }],
            },
          ],
        },
      },
    );

    return;
  },

  down: async (queryInterface) => {
    return await queryInterface.removeColumn("Tiles", "url");
  },
};
