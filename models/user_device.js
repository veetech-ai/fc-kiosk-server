"use strict";

module.exports = (sequelize, DataTypes) => {
  const Organization_Device = sequelize.define(
    "Organization_Device",
    {
      orgId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      device_id: DataTypes.INTEGER,
      device_name: DataTypes.STRING,
      status: DataTypes.TINYINT,
      share_by: DataTypes.INTEGER,
      can_share: DataTypes.BOOLEAN,
      remote_id: DataTypes.BOOLEAN,
      share_verify_token: DataTypes.STRING,
      can_change_geo_fence: DataTypes.BOOLEAN,
      can_change_scheduling: DataTypes.BOOLEAN,
    },
    {},
  );
  Organization_Device.associate = function (models) {
    models.Organization_Device.belongsTo(models.Organization, {
      as: "Organization",
      foreignKey: "orgId",
      sourceKey: "id",
    });
    // models.Organization_Device.belongsTo(models.Organization, { as: 'ShareByOrganization', foreignKey: 'share_by', sourceKey: 'id' })
    models.Organization_Device.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
      sourceKey: "id",
    });
  };
  return Organization_Device;
};
