"use strict";
module.exports = (sequelize, DataTypes) => {
  const Fv_Resets = sequelize.define(
    "Fv_Resets",
    {
      fv: DataTypes.STRING,
      device_id: DataTypes.INTEGER,
      resets: DataTypes.INTEGER,
    },
    {},
  );
  Fv_Resets.associate = function (models) {
    // associations can be defined here
  };
  return Fv_Resets;
};
