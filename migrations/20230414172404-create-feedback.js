"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.createTable("Feedbacks", {
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
        phone: {
          type: Sequelize.STRING,
          allowNull: true,
        },
        rating: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        contact_medium: {
          type: Sequelize.STRING,
          allowNull: true,
        },
      }),
      queryInterface.addIndex("Feedbacks", ["rating"]),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Feedbacks");
  },
};
