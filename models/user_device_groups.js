"use strict";
module.exports = (sequelize, DataTypes) => {
  const Organization_Device_Groups = sequelize.define(
    "Organization_Device_Groups",
    {
      schedule_id: DataTypes.INTEGER,
      orgId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      mqtt_token: DataTypes.STRING,
      fv: DataTypes.STRING,
    },
    {},
  );
  Organization_Device_Groups.associate = function (models) {
    models.Organization_Device_Groups.hasMany(
      models.Organization_Device_Groups_Items,
      {
        as: "Organization_Device_Groups_Items",
        foreignKey: "organization_device_group_id",
      },
    );
    models.Organization_Device_Groups.belongsTo(models.Organization, {
      as: "Owner",
      foreignKey: "orgId",
    });
  };
  return Organization_Device_Groups;
};
