"use strict";
const organizationsWithAuthorities =
  require("../common/organization_with_authorities").organizationWithAuthorities;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Organizations", "typeId", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: organizationsWithAuthorities.basic.id,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Organizations", "typeId"),
    ]);
  },
};
