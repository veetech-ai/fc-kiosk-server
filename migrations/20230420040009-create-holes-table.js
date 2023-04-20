"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Holes", {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER,
        },
        g_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Games",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
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
        user_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        tracked_shots: {
          type: Sequelize.JSON,
          allowNull: true,
        },
        no_of_shots: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        par: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        hole_id: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        hole_number: {
          type: Sequelize.INTEGER,
          allowNull: true,
        },
        is_gir: {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
        shots_from_green: {
          type: Sequelize.INTEGER,
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
      await queryInterface.addIndex("Holes", ["no_of_shots"]),
      await queryInterface.addIndex("Holes", ["par"]),
      await queryInterface.addIndex("Holes", ["is_gir"]),
      await queryInterface.addIndex("Holes", ["shots_from_green"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Holes");
  },
};
