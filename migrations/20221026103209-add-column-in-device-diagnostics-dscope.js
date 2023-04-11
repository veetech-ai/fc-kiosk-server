"use strict";

module.exports = {
  up: (queryInterface, Sequelize) => {
    return Promise.all([
      queryInterface.addColumn("Device_Diagnostics", "dscope_error", {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      }),
      queryInterface.addColumn(
        "Device_Diagnostics",
        "dscope_error_updated_at",
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
      queryInterface.removeColumn("Device_Diagnostics", "dscope_error"),
      queryInterface.removeColumn(
        "Device_Diagnostics",
        "dscope_error_updated_at",
      ),
    ]);
  },
};
