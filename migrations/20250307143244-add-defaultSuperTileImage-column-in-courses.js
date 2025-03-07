"use strict";

const path = require("path");
const fs = require("fs");
const { upload_file } = require("../common/upload");
const { Course } = require("../models");
const { createFormidableFileObject } = require("../common/helper");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Courses", "defaultSuperTileImage", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    const superTileFilePath = path.join(
      __dirname,
      "../assets/defaultsupertileimage.jpeg",
    );

    try {
      if (fs.existsSync(superTileFilePath)) {
        const superTileFile = createFormidableFileObject(superTileFilePath);
        let defaultSuperTileImage = null;
        const allowedTypes = ["jpg", "jpeg", "png", "webp"];

        if (superTileFile)
          defaultSuperTileImage = await upload_file(
            superTileFile,
            "uploads/tiles",
            allowedTypes,
          );
        console.log(defaultSuperTileImage);
        // update courses
        await Course.update(
          {
            defaultSuperTileImage,
          },
          {
            where: {
              defaultSuperTileImage: null,
            },
          },
        );
      }
    } catch (error) {
      console.error(`Error uploading file:`, error);
      throw error;
    }
  },

  down: async (queryInterface) => {
    await queryInterface.removeColumn("Courses", "defaultSuperTileImage");
  },
};
