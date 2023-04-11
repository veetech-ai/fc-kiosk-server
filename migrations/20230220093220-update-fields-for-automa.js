"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Device_Diagnostics",
        "battery_charging_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      ),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "battery_charged_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      ),
      queryInterface.addColumn("Device_Diagnostics", "no_charging_updated_at", {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }),
      queryInterface.addColumn("Device_Diagnostics", "vbat_alert_updated_at", {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "battery_charging_updated_at",
      ),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "battery_charged_updated_at",
      ),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "no_charging_updated_at",
      ),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "vbat_alert_updated_at",
      ),
    ]);
  },
};
