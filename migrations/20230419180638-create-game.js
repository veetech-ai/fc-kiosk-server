"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Games", {
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
        owner_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Users",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        participant_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        participant_name: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        start_time: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        end_time: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        gc_name: {
          type: Sequelize.STRING,
          allowNull: false,
          references: {
            model: "Courses",
            key: "name",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        total_shots_taken: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        total_ideal_shots: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        invite_id: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      }),
      queryInterface.addIndex("Games", ["gc_name"]),
      queryInterface.addIndex("Games", ["total_shots_taken"]),
      queryInterface.addIndex("Games", ["total_ideal_shots"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Games");
  },
};
