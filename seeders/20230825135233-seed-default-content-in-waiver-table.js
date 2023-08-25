"use strict";

const { Op } = require("sequelize");
const { Course, Waiver } = require("./../models");
const { generateWaiverHtmlContent } = require("../data/waiver");

const createdWaiverIds = [];

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up() {
    try {
      const courses = await Course.findAll();

      // Seed HTML content for each course
      for (const course of courses) {
        const gcId = course.id;

        // Check if a waiver already exists for this gcId
        const existingWaiver = await Waiver.findOne({
          where: { gcId },
        });

        if (!existingWaiver) {
          const htmlContent = generateWaiverHtmlContent();
          const wv = await Waiver.create({
            gcId,
            content: htmlContent,
            name: "Cart Rental Agreement",
          });

          createdWaiverIds.push(wv.id);
          console.log(`Waiver created for ${gcId}`);
        } else {
          console.log(`Waiver already exists for ${gcId}. Skipping.`);
        }
      }
    } catch (err) {
      console.log(err);
    }
  },

  async down() {
    await Waiver.destroy({ where: { id: { [Op.in]: createdWaiverIds } } });
  },
};
