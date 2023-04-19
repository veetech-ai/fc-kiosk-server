"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Screen_Configs", {
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
        course_info: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        coupons: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        lessons: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        statistics: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        memberships: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        feedback: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        careers: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
        shop: {
          type: Sequelize.BOOLEAN,
          allowNull: true,
        },
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Screen_Configs");
  },
};
