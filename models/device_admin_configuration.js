"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Admin_Configuration = sequelize.define(
    "Device_Admin_Configuration",
    {
      device_id: DataTypes.INTEGER,
      config: {
        type: DataTypes.JSON,
        get() {
          return JSON.parse(this.getDataValue("config"));
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("config", value);
          } catch (e) {
            this.setDataValue("config", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  Device_Admin_Configuration.associate = function (models) {
    // associations can be defined here
  };
  return Device_Admin_Configuration;
};
