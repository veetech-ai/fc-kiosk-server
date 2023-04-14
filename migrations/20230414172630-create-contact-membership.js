


"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.createTable("Contact_Membership", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      m_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Memberships',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gc_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Courses',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      org_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Organizations',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      user_phone: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_email: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      field: {
        type: Sequelize.STRING,
        allowNull: true,
      },
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.dropTable("Contact_Membership");
  },
};


