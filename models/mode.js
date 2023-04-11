"use strict";
module.exports = (sequelize, DataTypes) => {
  const Mode = sequelize.define(
    "Mode",
    {
      name: DataTypes.STRING,
      value: DataTypes.INTEGER,
      status: DataTypes.TINYINT,
    },
    {},
  );
  Mode.associate = function (models) {
    // associations can be defined here
  };
  return Mode;
};
