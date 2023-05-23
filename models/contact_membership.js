"use strict";
module.exports = (sequelize, DataTypes) => {
  const Contact_Membership = sequelize.define(
    "Contact_Membership",
    {
      gcId: {
        field: "gc_id",
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
      mId: {
        field: "m_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Memberships",
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
      isAddressed: {
        field: "is_addressed",
        type: DataTypes.BOOLEAN,
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
  Contact_Membership.associate = function (models) {
    // associations can be defined here
    Contact_Membership.belongsTo(models.Organization, { foreignKey: "org_id" });
    Contact_Membership.belongsTo(models.Course, { foreignKey: "gc_id" });
    Contact_Membership.belongsTo(models.Membership, { foreignKey: "m_id" });
  };
  return Contact_Membership;
};
