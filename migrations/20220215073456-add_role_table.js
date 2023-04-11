"use strict";
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable("Roles", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("NOW()"),
      },
      get_users: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      manage_users: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      get_devices: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      manage_devices: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
      super: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false,
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable("Roles");
  },
};
