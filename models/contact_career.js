"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContactCareer = sequelize.define(
    "ContactCareer",
    {
      gcId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      careerId: {
        field: "career_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Careers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      userPhone: {
        field: "user_phone",
        type: DataTypes.STRING,
        allowNull: true,
      },
      userEmail: {
        field: "user_email",
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactMedium: {
        field: "contact_medium",
        type: DataTypes.ENUM("phone", "email"),
        allowNull: true,
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
  ContactCareer.associate = function (models) {
    // associations can be defined here
    models.ContactCareer.belongsTo(models.Organization, { foreignKey: "org_id" });
    models.ContactCareer.belongsTo(models.Course, { foreignKey: "gc_id" });
    models.ContactCareer.belongsTo(models.Career, { foreignKey: "career_id" });
  };
  return ContactMembership;
};
