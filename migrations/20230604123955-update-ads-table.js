"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.removeColumn("Ads", "gc_id"),
      await queryInterface.addColumn("Ads", "gcId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Mobile_Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.removeColumn("Ads", "org_id"),
      await queryInterface.removeColumn("Ads", "small_image"),
      await queryInterface.addColumn("Ads", "smallImage", {
        type: Sequelize.STRING,
        allowNull: false,
      }),
      await queryInterface.renameColumn("Ads", "big_image", "bigImage"),

      await queryInterface.removeColumn("Ads", "state_id"),
      await queryInterface.removeColumn("Ads", "screen_id"),
      await queryInterface.removeIndex("Ads", ["ad_type"]),

      await queryInterface.removeColumn("Ads", "ad_type"),

      await queryInterface.addColumn("Ads", "screens", {
        type: Sequelize.JSON,
        allowNull: false,
      }),
      await queryInterface.addColumn("Ads", "tapLink", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.addColumn("Ads", "gc_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.removeColumn("Ads", "gcId"),
      await queryInterface.addColumn("Ads", "org_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.addColumn("Ads", "small_image", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      await queryInterface.removeColumn("Ads", "smallImage"),
      await queryInterface.renameColumn("Ads", "bigImage", "big_image"),
      await queryInterface.addColumn("Ads", "state_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Country_States",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.addColumn("Ads", "screen_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Ad_screens",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      await queryInterface.addColumn("Ads", "ad_type", {
        type: Sequelize.ENUM("kiosk", "mobile"),
        allowNull: true,
      }),
      await queryInterface.removeColumn("Ads", "screens"),

      await queryInterface.addIndex("Ads", ["ad_type"]),
    ]);
  },
};
