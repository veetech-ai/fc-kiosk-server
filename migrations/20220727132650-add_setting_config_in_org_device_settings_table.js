"use strict";
const config = require("../config/config");
module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Organization_Device_settings",
        "settings_config",
        {
          type: Sequelize.JSON,
          defaultValue: `{"timezone_name":"${config.timeZone}","scale_factor_min_val":"1","scale_factor_max_val":"5","scale_factor":"2","timezone":null}`,
        },
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        "Organization_Device_settings",
        "settings_config",
      ),
    ]);
  },
};
