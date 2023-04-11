"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.changeColumn(
        "Device_Diagnostics",
        "rfid_io_error_updated_at",
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
      queryInterface.changeColumn(
        "Device_Diagnostics",
        "rfid_io_error_updated_at",
        {
          type: Sequelize.DATE(6),
          allowNull: false,
        },
      ),
    ]);
  },
};
