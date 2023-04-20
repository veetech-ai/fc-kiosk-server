"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContactCoach = sequelize.define(
    "ContactCoach",
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
      coachId: {
        field: "coach_id",
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
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {},
  );
  ContactCoach.associate = function (models) {
    // associations can be defined here
    models.ContactCoach.belongsTo(models.Organization, {
      foreignKey: "org_id",
    });
    models.ContactCoach.belongsTo(models.Course, { foreignKey: "gc_id" });
    models.ContactCoach.belongsTo(models.Coach, { foreignKey: "coach_id" });
  };

  return ContactCoach;
};
