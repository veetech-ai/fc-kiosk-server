"use strict";

const config = require("../config/config");
const { Organization } = require("../models");
module.exports = {
  up: async (queryInterface, Sequelize) => {
    if (config.env == "test") {
      const zongOrg = await Organization.findOne({ where: { name: "Zong" } });
      if (!zongOrg) return;
      return queryInterface.bulkInsert("Schedules", [
        {
          orgId: zongOrg.id,
          name: "Testing",
          description: "Schedule for Testing",
          schedule: JSON.stringify(
            '{"mon":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}],"tue":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}],"wed":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}],"thr":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}],"fri":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}],"sat":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}],"sun":[{"i":23,"timestamp":1548999000000,"t":4},{"i":95,"timestamp":1549063800000,"t":1}]}',
          ),
          admin_created: true,
          mqtt_token: "trTUtrqM",
        },
      ]);
    }
  },

  down: (queryInterface, Sequelize) => {
    // return queryInterface.bulkDelete('Schedules', null, {});
  },
};
