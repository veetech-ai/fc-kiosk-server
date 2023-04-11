"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn(
        "Device_Diagnostics",
        "frontend_connection_error",
        {
          type: Sequelize.BOOLEAN,
          defaultValue: false,
        },
      ),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "frontend_connection_error_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      ),
      queryInterface.addColumn("Device_Diagnostics", "motor_io", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn("Device_Diagnostics", "motor_io_updated_at", {
        type: Sequelize.DATE(6),
        allowNull: false,
        defaultValue: Sequelize.NOW,
      }),
      queryInterface.addColumn("Device_Diagnostics", "cteu_reconnect_error", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "cteu_reconnect_error_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      ),
      queryInterface.addColumn("Device_Diagnostics", "cteu_ip_error", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "cteu_ip_error_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      ),
      queryInterface.addColumn("Device_Diagnostics", "rfid_io_warning", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "rfid_io_warning_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
          defaultValue: Sequelize.NOW,
        },
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "frontend_connection_error",
      ),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "frontend_connection_error_updated_at",
      ),
      queryInterface.removeColumn("Device_Diagnostics", "motor_io"),
      queryInterface.removeColumn("Device_Diagnostics", "motor_io_updated_at"),
      queryInterface.removeColumn("Device_Diagnostics", "cteu_reconnect_error"),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "cteu_reconnect_error_updated_at",
      ),
      queryInterface.removeColumn("Device_Diagnostics", "cteu_ip_error"),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "cteu_ip_error_updated_at",
      ),
      queryInterface.removeColumn("Device_Diagnostics", "rfid_io_warning"),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "rfid_io_warning_updated_at",
      ),
    ]);
  },
};
