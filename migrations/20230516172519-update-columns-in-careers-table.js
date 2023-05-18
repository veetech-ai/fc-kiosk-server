"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface
        .addColumn("Careers", "gcId", {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Courses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        })
        .then(() => {
          queryInterface.removeColumn("Careers", "gc_id");
        }),

      queryInterface
        .addColumn("Careers", "orgId", {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: "Organizations",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        })
        .then(() => {
          queryInterface.removeColumn("Careers", "org_id");
        }),

      queryInterface.changeColumn("Careers", "title", {
        type: Sequelize.STRING,
        allowNull: false,
      }),

      queryInterface.changeColumn("Careers", "content", {
        type: Sequelize.TEXT,
        allowNull: false,
      }),

      queryInterface.changeColumn("Careers", "type", {
        type: Sequelize.STRING,
        allowNull: false,
      }),

      queryInterface.changeColumn("Careers", "timings", {
        type: Sequelize.JSON,
        allowNull: false,
      }),
    ]);
  },

  async down(queryInterface, Sequelize) {
    return Promise.all([
      queryInterface.addColumn("Careers", "gc_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.removeColumn("Careers", "gcId"),

      queryInterface.addColumn("Careers", "org_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      }),
      queryInterface.removeColumn("Careers", "orgId"),

      queryInterface.changeColumn("Careers", "title", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn("Careers", "content", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn("Careers", "type", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
      queryInterface.changeColumn("Careers", "timings", {
        type: Sequelize.STRING,
        allowNull: true,
      }),
    ]);
  },
};
