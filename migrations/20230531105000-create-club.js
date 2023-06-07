"use strict";
/** @type {import('sequelize-cli').Migration} */

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("Clubs", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      driver: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wood3: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wood5: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      iron4: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      iron5: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      iron6: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      iron7: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      iron8: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      iron9: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      pitchingWedge: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wedge52: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wedge56: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      wedge60: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      putter: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      gapWedge: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      sandWedge: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lobWedge: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable("Clubs");
  },
};
