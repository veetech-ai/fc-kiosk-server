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
          defaultValue: true,
        },
        coupons: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        lessons: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        statistics: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        memberships: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        feedback: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        careers: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
        shop: {
          type: Sequelize.BOOLEAN,
          defaultValue: true,
        },
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Screen_Configs");
  },
};
