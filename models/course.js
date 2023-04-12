"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Courses",
    {
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      country: DataTypes.STRING,
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
      lat: DataTypes.DOUBLE,
      long: DataTypes.DOUBLE,
    },
    {},
  );
  Course.associate = function (models) {
    // associations can be defined here
  };
  return Course;
};
