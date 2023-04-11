"use strict";
module.exports = (sequelize, DataTypes) => {
  const Geofences = sequelize.define(
    "Geofences",
    {
      name: DataTypes.STRING,
      radius: DataTypes.STRING,
      lat: DataTypes.STRING,
      lng: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
      orgId: DataTypes.INTEGER,
    },
    {},
  );
  Geofences.associate = function (models) {
    // associations can be defined here
    models.Geofences.hasMany(models.Organization_Device_settings, {
      as: "Organization_Device_settings",
      foreignKey: "geofence_id",
    });
  };
  return Geofences;
};
