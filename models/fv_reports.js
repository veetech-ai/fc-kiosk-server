"use strict";
module.exports = (sequelize, DataTypes) => {
  const Fv_Reports = sequelize.define(
    "Fv_Reports",
    {
      fv: DataTypes.STRING,
      devices: DataTypes.INTEGER,
      resets: DataTypes.INTEGER,
      runt: DataTypes.INTEGER,
      v0_lp: DataTypes.INTEGER,
      v0_hp: DataTypes.INTEGER,
      v0_info: DataTypes.INTEGER,
      vp_lp: DataTypes.INTEGER,
      vp_hp: DataTypes.INTEGER,
      vp_info: DataTypes.INTEGER,
    },
    {},
  );
  Fv_Reports.associate = function (models) {
    // associations can be defined here
  };
  return Fv_Reports;
};
