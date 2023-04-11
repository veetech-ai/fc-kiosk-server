"use strict";
module.exports = (sequelize, DataTypes) => {
  const Fv_Runtimes = sequelize.define(
    "Fv_Runtimes",
    {
      fv: DataTypes.STRING,
      device_id: DataTypes.INTEGER,
      resets: DataTypes.INTEGER,
      runt: DataTypes.INTEGER,
    },
    {},
  );
  Fv_Runtimes.associate = function (models) {
    // associations can be defined here
  };
  return Fv_Runtimes;
};
