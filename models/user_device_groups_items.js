"use strict";
module.exports = (sequelize, DataTypes) => {
  const Organization_Device_Groups_Items = sequelize.define(
    "Organization_Device_Groups_Items",
    {
      organization_device_group_id: DataTypes.INTEGER,
      orgId: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
    },
    {},
  );
  Organization_Device_Groups_Items.associate = function (models) {
    models.Organization_Device_Groups_Items.belongsTo(
      models.Organization_Device_Groups,
      {
        as: "Organization_Device_Group",
        foreignKey: "organization_device_group_id",
      },
    );
    models.Organization_Device_Groups_Items.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
    });
  };
  return Organization_Device_Groups_Items;
};
