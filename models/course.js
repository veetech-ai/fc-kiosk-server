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
      content: DataTypes.TEXT,
      images: DataTypes.JSON,
      year_built: DataTypes.INTEGER,
      architects: DataTypes.STRING,
      greens: DataTypes.STRING,
      fairways: DataTypes.STRING,
      members: DataTypes.STRING,
      season: DataTypes.STRING,
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organization",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {},
  );
  Course.associate = function (models) {
    // associations can be defined here
    models.Course.belongsTo(models.Organization, { foreignKey: "org_id" });
    models.Course.hasMany(models.FAQ, {
      as: "FAQs",
      foreignKey: "gc_id",
    });
    models.Course.hasMany(models.Feedback, {
      as: "Feedbacks",
      foreignKey: "gc_id",
    });
    models.Course.hasMany(models.Coach, {
      as: "Coaches",
      foreignKey: "gc_id",
    });
    models.Course.hasMany(models.Membership, {
      as: "Memberships",
      foreignKey: "gc_id",
    });
    models.Course.hasMany(models.ContactMembership, {
      as: "ContactMemberships",
      foreignKey: "gc_id",
    });
    models.Course.hasMany(models.Shop, {
      as: "Shops",
      foreignKey: "gc_id",
    });
    models.Course.hasMany(models.Career, {
      as: "Careers",
      foreignKey: "gc_id",
    });
    Course.hasMany(models.Hole, {
      as: "Holes",
      foreignKey: "gc_id",
    });
  };
  return Course;
};
