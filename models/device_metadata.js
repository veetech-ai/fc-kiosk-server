"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_Metadata = sequelize.define(
    "Device_Metadata",
    {
      device_id: DataTypes.INTEGER,
      fv: DataTypes.STRING,
      key: DataTypes.STRING,
      value: DataTypes.STRING,
      type: DataTypes.INTEGER,
      log: DataTypes.STRING,
    },
    {},
  );
  Device_Metadata.associate = function (models) {
    // associations can be defined here
  };
  return Device_Metadata;
};
