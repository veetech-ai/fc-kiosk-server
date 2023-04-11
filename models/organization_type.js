"use strict";
module.exports = (sequelize, DataTypes) => {
  const Organization_Type = sequelize.define(
    "Organization_Type",
    {
      title: DataTypes.STRING,
      peopleMetrics: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
        field: "people_metrics",
      },
      simKiosk: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
        field: "sim_kiosk",
      },
      weatherStation: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
        field: "weather_station",
      },
      devices: {
        type: DataTypes.BOOLEAN,
        defaultValue: "false",
        field: "devices",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "updated_at",
      },
    },
    {},
  );
  Organization_Type.associate = function (models) {
    // associations can be defined here
  };
  return Organization_Type;
};
