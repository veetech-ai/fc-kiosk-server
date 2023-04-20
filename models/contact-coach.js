"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContactCoach = sequelize.define(
    "ContactCoach",
    {
      gcId: {
        field: "gc_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      coachId: {
        field: "coach_id",
        type: DataTypes.INTEGER,
        allowNull: false,
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
    ContactCoach.belongsTo(models.Organization, {
      foreignKey: "org_id",
    });
    ContactCoach.belongsTo(models.Course, { foreignKey: "gc_id" });
    ContactCoach.belongsTo(models.Coach, { foreignKey: "coach_id" });
  };

  return ContactCoach;
};
