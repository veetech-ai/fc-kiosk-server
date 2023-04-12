"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Courses",
    {

      name: DataTypes.STRING,
      address: DataTypes.JSON,
      phone: DataTypes.STRING,
      coordinates: DataTypes.JSON,
    },
    {},
  );
  Course.associate = function (models) {
    // associations can be defined here
  };
  return Course;
};
