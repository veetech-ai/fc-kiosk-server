"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Careers", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        gc_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Courses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        org_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Organizations",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        title: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        type: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        timmings: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        link: {
          type: Sequelize.STRING,
          allowNull: true,
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
      }),
      await queryInterface.addIndex("Careers", ["title"]),
      await queryInterface.addIndex("Careers", ["type"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Careers");
  },
};
