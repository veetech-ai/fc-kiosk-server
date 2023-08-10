"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Course_Tiles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      isPublished: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      isSuperTile: {
        type: Sequelize.BOOLEAN,
        allowNull: true,
      },
      order: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      layoutNumber: {
        type: Sequelize.ENUM(0, 1, 2, 3),
        defaultValue: 0,
      },
      tileId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Tiles",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      gcId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
        onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface) {
    return queryInterface.dropTable("Course_Tiles");
  },
};
