"use strict";

const { Op } = require("sequelize");

const builtInTiles = [
  { name: "Course Info", builtIn: true },
  { name: "Coupons", builtIn: true },
  { name: "Lessons", builtIn: true },
  { name: "Memberships", builtIn: true },
  { name: "Feedback", builtIn: true },
  { name: "Careers", builtIn: true },
  { name: "Shop", builtIn: true },
  { name: "Rent A Cart", builtIn: true },
  { name: "Ghin App", builtIn: true },
  { name: "Wedding Event", builtIn: true },
  { name: "FAQs", builtIn: true },
];
const tileNames = builtInTiles.map((tile) => tile.name);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    const existingTiles = await queryInterface.select(null, "Tiles", {
      where: { name: { [Op.in]: tileNames } },
    });

    for (const tile of builtInTiles) {
      const exists = existingTiles.find((_tile) => _tile.name == tile.name);

      if (exists) continue;

      await queryInterface.insert(null, "Tiles", tile);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Tiles", {
      where: { name: { [Op.in]: tileNames } },
    });
  },
};
