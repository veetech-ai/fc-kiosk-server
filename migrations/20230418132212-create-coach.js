"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Coaches", {
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
        name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        title: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        content: {
          type: Sequelize.TEXT,
          allowNull: true,
        },
        image: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        timmings: {
          type: Sequelize.JSON,
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
      queryInterface.addIndex("Coaches", ["name"]),
      queryInterface.addIndex("Coaches", ["title"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Coaches");
  },
};
