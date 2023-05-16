'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeConstraint('Ads', 'Ads_ibfk_3');
    await queryInterface.changeColumn('Ads', 'state_id', {
      type: Sequelize.STRING
    });
    await queryInterface.renameColumn('Ads', 'state_id', 'state');
 
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.renameColumn('Ads', 'state', 'state_id');
    await queryInterface.changeColumn('Ads', 'state_id', {
      type: Sequelize.INTEGER
    });
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
