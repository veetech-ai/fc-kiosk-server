"use strict";

const { Op } = require("sequelize");
const fs = require("fs");
const path = require("path");

const builtInTiles = [
  { type: "Course Info", builtIn: true, fileName: "course_info.png" },
  { type: "Coupons", builtIn: true, fileName: "coupons.png" },
  { type: "Lessons", builtIn: true, fileName: "training.png" },
  { type: "Memberships", builtIn: true, fileName: "membership.png" },
  { type: "Feedback", builtIn: true, fileName: "feedback.png" },
  { type: "Careers", builtIn: true, fileName: "careers.png" },
  { type: "Shop", builtIn: true, fileName: "shop1.png" },
  { type: "Statistics", builtIn: true, fileName: "stats.png" },
  { type: "Rent A Cart", builtIn: true, fileName: "rent_a_cart.png" },
  { type: "Ghin App", builtIn: true, fileName: "GHIN.png" },
  { type: "Wedding Event", builtIn: true, fileName: "wedding_icon.png" },
  { type: "FAQs", builtIn: true, fileName: "faq.png" },
];
const tileTypes = builtInTiles.map((tile) => tile.type);

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize, courseId) {
    const existingTiles = await queryInterface.select(null, "Tiles", {
      where: { type: { [Op.in]: tileTypes }, courseId },
    });

    for (const tile of builtInTiles) {
      const exists = existingTiles.find((_tile) => _tile.type == tile.type);

      if (exists) continue;

      tile.courseId = courseId;

      const filePath = path.join(__dirname, "../assets", tile.fileName);
      if (fs.existsSync(filePath)) {
        tile.filePath = filePath;
      }

      // if (files && files[tile.type]) {
      //   const filePath = path.join(
      //     __dirname,
      //     "uploads",
      //     files[tile.type].originalname,
      //   );
      //   fs.writeFileSync(filePath, files[tile.type].buffer);
      //   tile.filePath = filePath;
      // }

      await queryInterface.insert(null, "Tiles", tile);
    }
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete("Tiles", {
      where: { type: { [Op.in]: tileTypes } },
    });
  },
};
