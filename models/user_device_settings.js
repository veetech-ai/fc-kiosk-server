"use strict";
module.exports = (sequelize, DataTypes) => {
  const Organization_Device_settings = sequelize.define(
    "Organization_Device_settings",
    {
      settings: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("settings"));
            return JSON.parse(this.getDataValue("settings"));
          } catch (e) {
            return this.getDataValue("settings");
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("settings", value);
          } catch (e) {
            this.setDataValue("settings", JSON.stringify(value));
          }
        },
      },
      settings_config: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("settings_config"));
            return JSON.parse(this.getDataValue("settings_config"));
          } catch (e) {
            return this.getDataValue("settings_config");
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("settings_config", value);
          } catch (e) {
            this.setDataValue("settings_config", JSON.stringify(value));
          }
        },
      },
      currentConfig: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("currentConfig"));
            return JSON.parse(this.getDataValue("currentConfig"));
          } catch (e) {
            return this.getDataValue("currentConfig");
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("currentConfig", value);
          } catch (e) {
            this.setDataValue("currentConfig", JSON.stringify(value));
          }
        },
      },
      updatedConfig: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("updatedConfig"));
            return JSON.parse(this.getDataValue("updatedConfig"));
          } catch (e) {
            return this.getDataValue("updatedConfig");
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("updatedConfig", value);
          } catch (e) {
            this.setDataValue("updatedConfig", JSON.stringify(value));
          }
        },
      },
      orgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      device_id: DataTypes.INTEGER,
      status: DataTypes.TINYINT,
      geofence_id: DataTypes.INTEGER,
      schedule_id: DataTypes.INTEGER,
    },
    {},
  );
  Organization_Device_settings.associate = function (models) {
    // associations can be defined here
    models.Organization_Device_settings.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
    });
    models.Organization_Device_settings.belongsTo(models.Schedule, {
      as: "Schedule",
      foreignKey: "schedule_id",
    });
  };
  return Organization_Device_settings;
};
