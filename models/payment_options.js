"use strict";
module.exports = (sequelize, DataTypes) => {
  const Payment_Options = sequelize.define(
    "Payment_Options",
    {
      title: DataTypes.STRING,
      description: DataTypes.TEXT,
      image: DataTypes.STRING,
      status: DataTypes.BOOLEAN,
    },
    {},
  );
  Payment_Options.associate = function (models) {
    // associations can be defined here
  };
  return Payment_Options;
};
