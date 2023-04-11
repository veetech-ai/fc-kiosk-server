"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Device_Diagnostics", "rfid_io_error", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "rfid_io_error_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
        },
      ),
    ]);
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.removeColumn("Device_Diagnostics", "rfid_io_error"),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "rfid_io_error_updated_at",
      ),
    ]);
  },
};
