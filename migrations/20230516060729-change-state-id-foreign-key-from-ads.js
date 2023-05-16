'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Ads', 'Ads_ibfk_3');
    await queryInterface.changeColumn('Ads', 'state_id', {
      type: Sequelize.STRING
    });
    await queryInterface.renameColumn('Ads', 'state_id', 'state');
    await queryInterface.addColumn('Ads', 'title', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Ads', 'tabLink', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('Ads', 'alternateLink', {
      type: Sequelize.STRING,
      allowNull: true,
    });


 
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Ads', 'state', 'state_id');
    await queryInterface.changeColumn('Ads', 'state_id', {
      type: Sequelize.INTEGER
    });
    await queryInterface.removeColumn('Ads', 'title');
    await queryInterface.removeColumn('Ads', 'tabLink');
    await queryInterface.removeColumn('Ads', 'alternateLink');
    await queryInterface.addConstraint('Ads', {
      fields: ['state_id'],
      type: 'foreign key',
      references: {
        table: 'States',
        field: 'id'
      },
      onDelete: 'set null',
      onUpdate: 'cascade',
      name: 'Ads_ibfk_3' // Make sure to add the foreign key constraint name
    });
  }
};
