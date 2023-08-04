"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Events", {
      id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      gcId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Mobile_Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      openingTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      closingTime: {
        type: Sequelize.TIME,
        allowNull: false,
      },
      address: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      corousal: {
        type: Sequelize.JSON,
        allowNull: true,
        description: "Array of URLs of images",
      },
      description: {
        type: Sequelize.STRING,
        allowNull: true,
        defaultValue: null,
      },
      details: {
        // There's open discussion here: whether to use VARCHAR(255), MEDIUMTEXT or LONGTEXT
        type: Sequelize.TEXT,
        allowNull: true,
        defaultValue: null,
        description: "A rich text log description in HTML format",
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("Events");
  },
};
