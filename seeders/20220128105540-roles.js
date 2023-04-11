"use strict";

const { getRolesWithAuthorities } = require("../common/roles_with_authorities");
const { rolesData, defaultAuthorities } = getRolesWithAuthorities();
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert("Roles", rolesData, {
      updateOnDuplicate: ["title", ...defaultAuthorities],
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Roles", null, {});
  },
};
