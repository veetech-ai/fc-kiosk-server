"use-strict";

module.exports = (sequelize, DataTypes) => {
  const Organization = sequelize.define(
    "Organization",
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
    },
    {},
  );
  Organization.associate = function (models) {
    // associations can be defined here
    models.Organization.hasMany(models.User, {
      as: "Users",
      foreignKey: "orgId",
    });

    models.Organization.hasMany(models.Schedule, {
      as: "Schedules",
      foreignKey: "orgId",
    });
    models.Organization.hasMany(models.Course, {
      as: "Courses",
      foreignKey: "orgId",
    });
    models.Organization.hasMany(models.FAQ, {
      as: "FAQs",
      foreignKey: "orgId",
    });
  };
  return Organization;
};
