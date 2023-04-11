"use strict";
module.exports = (sequelize, DataTypes) => {
  const Organization_Device_Scheduling = sequelize.define(
    "Organization_Device_Scheduling",
    {
      schedule: {
        type: DataTypes.JSON,
        get() {
          return JSON.parse(this.getDataValue("schedule"));
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("schedule", value);
          } catch (e) {
            this.setDataValue("schedule", JSON.stringify(value));
          }
        },
      },
      orgId: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      status: DataTypes.TINYINT,
    },
    {},
  );
  Organization_Device_Scheduling.associate = function (models) {
    models.Organization_Device_Scheduling.belongsTo(models.Organization, {
      as: "Organization",
      foreignKey: "orgId",
      sourceKey: "id",
    });
    models.Organization_Device_Scheduling.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
      sourceKey: "id",
    });
  };
  return Organization_Device_Scheduling;
};
