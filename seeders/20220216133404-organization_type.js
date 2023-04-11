"use strict";
const organizationWithAuthorities =
  require("../common/organization_with_authorities").getOrganizationWithAuthorities();

module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert(
      "Organization_Types",
      organizationWithAuthorities,
      {
        updateOnDuplicate: [
          "title",
          "sim_kiosk",
          "weather_station",
          "people_metrics",
          "devices",
        ],
      },
    );
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete("Organization_Types", null, {});
  },
};
