"use strict";
module.exports = (sequelize, DataTypes) => {
  const ContactMembership = sequelize.define(
    "ContactMembership",
    {
      gc_id: {
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
      user_phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contact_medium: {
        type: DataTypes.ENUM("phone", "email", "qrcode"),
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
  ContactMembership.associate = function (models) {
    // associations can be defined here
    ContactMembership.belongsTo(models.Organization, { foreignKey: "org_id" });
    ContactMembership.belongsTo(models.Course, { foreignKey: "gc_id" });
    ContactMembership.belongsTo(models.Membership, { foreignKey: "m_id" });
  };
  return ContactMembership;
};
