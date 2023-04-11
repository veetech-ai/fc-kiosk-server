"use strict";
module.exports = (sequelize, DataTypes) => {
  const Firmwares = sequelize.define(
    "Firmwares",
    {
      name: DataTypes.STRING,
      ver: DataTypes.STRING,
      hw_ver: DataTypes.STRING,
      status: DataTypes.INTEGER,
      file: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {},
  );
  Firmwares.associate = function (models) {
    // associations can be defined here
  };
  return Firmwares;
};
