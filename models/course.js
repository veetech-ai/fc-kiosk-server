"use strict";
module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define(
    "Course",
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
      yards: DataTypes.INTEGER,
      par: DataTypes.INTEGER,
      holes: DataTypes.STRING,
      logo: DataTypes.STRING,
      slope: DataTypes.INTEGER,
      content: DataTypes.STRING,
      images: DataTypes.JSON,
      year_built: DataTypes.INTEGER,
      architects: DataTypes.STRING,
      greens: DataTypes.STRING,
      fairways: DataTypes.STRING,
      members: DataTypes.STRING,
      season: DataTypes.STRING,
      orgId: {
        type: DataTypes.INTEGER,
        defaultValue: null,
        field: "org_id",
      },
    },
    {},
  );
  Course.associate = function (models) {
    // associations can be defined here
    Course.belongsTo(models.Organization, { foreignKey: "orgId" });
    Course.hasMany(models.FAQ, {
      as: "FAQs",
      foreignKey: "gc_id",
    });
  };
  return Course;
};