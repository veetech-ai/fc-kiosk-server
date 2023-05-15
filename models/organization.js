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
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.FAQ, {
      as: "FAQs",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Feedback, {
      as: "Feedbacks",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Membership, {
      as: "Memberships",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.ContactMembership, {
      as: "ContactMemberships",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Shop, {
      as: "Shops",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Career, {
      as: "Careers",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Coach, {
      as: "Coaches",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Screen_Config, {
      as: "Screen_Configs",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Ad, {
      as: "Ads",
      foreignKey: "org_id",
    });
    models.Course.hasMany(models.ContactCareer, {
      as: "ContactCareers",
      foreignKey: "org_id",
    });
    models.Organization.hasMany(models.Contact_Coach, {
      as: "ContactCoaches",
      foreignKey: "org_id",
    });
  };
  return Organization;
};
