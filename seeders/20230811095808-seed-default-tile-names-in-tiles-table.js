"use strict";
// This seeder is deprecated and should not run.
console.warn(
  "Seeder 20230811095808-seed-default-tile-names-in-tiles-table.js is deprecated and will not run.",
);

const { Op } = require("sequelize");

const builtInTiles = [
  { type: "Course Info", builtIn: true },
  { type: "Coupons", builtIn: true },
  { type: "Lessons", builtIn: true },
  { type: "Memberships", builtIn: true },
  { type: "Feedback", builtIn: true },
  { type: "Careers", builtIn: true },
  { type: "Shop", builtIn: true },
  { type: "Statistics", builtIn: true },
  { type: "Rent A Cart", builtIn: true },
  { type: "webApp", builtIn: true },
  { type: "Wedding Event", builtIn: true },
  { type: "FAQs", builtIn: true },
];
const tileTypes = builtInTiles.map((tile) => tile.type);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface) {
    // Deprecated seeder, no operation performed.
    return;
    const existingTiles = await queryInterface.select(null, "Tiles", {
      where: { type: { [Op.in]: tileTypes } },
    });

    for (const tile of builtInTiles) {
      const exists = existingTiles.find((_tile) => _tile.type == tile.type);

      if (exists) continue;

      await queryInterface.insert(null, "Tiles", tile);
    }
  },

  async down(queryInterface) {
    // Deprecated seeder, no operation performed.
    return;
    await queryInterface.bulkDelete("Tiles", {
      where: { type: { [Op.in]: tileTypes } },
    });
  },
};
