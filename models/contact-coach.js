"use strict";
module.exports = (sequelize, DataTypes) => {
  const Contact_Coach = sequelize.define(
    "Contact_Coach",
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
      isAddressed: {
        field: "is_addressed",
        type: DataTypes.BOOLEAN
        defaultValue: false,
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
  Contact_Coach.associate = function (models) {
    // associations can be defined here
    Contact_Coach.belongsTo(models.Organization, {
      foreignKey: "org_id",
    });
    Contact_Coach.belongsTo(models.Course, { foreignKey: "gc_id" });
    Contact_Coach.belongsTo(models.Coach, { foreignKey: "coach_id" });
  };

  return Contact_Coach;
};
