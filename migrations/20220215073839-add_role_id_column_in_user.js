"use strict";
const rolesWithAuthorities =
  require("../common/roles_with_authorities").roleWithAuthorities;

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Users", "role_id", {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: rolesWithAuthorities.operator.id,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([queryInterface.removeColumn("Users", "role_id")]);
  },
};
