"use strict";
module.exports = (sequelize, DataTypes) => {
  const Timezones = sequelize.define(
    "Timezones",
    {
      area: DataTypes.STRING,
      time_zone_value: DataTypes.STRING,
      minutes_diff: DataTypes.STRING,
      hours_diff: DataTypes.STRING,
      tz: {
        type: DataTypes.STRING,
        unique: true,
      },
      status: DataTypes.TINYINT,
    },
    {},
  );
  Timezones.associate = function (models) {
    // associations can be defined here
  };
  return Timezones;
};
