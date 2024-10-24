"use strict";
module.exports = (sequelize, DataTypes) => {
  const Membership = sequelize.define(
    "Membership",
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
      link: {
        type: DataTypes.STRING,
        allowNull: true,
        validate: {
          isUrl: true,
        },
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal("NOW()"),
      },
    },
    {},
  );
  Membership.associate = function (models) {
    // associations can be defined here
    Membership.belongsTo(models.Course, { foreignKey: "gc_id" });
    Membership.belongsTo(models.Organization, { foreignKey: "org_id" });
    Membership.hasMany(models.Contact_Membership, {
      as: "ContactMemberships",
      foreignKey: "m_id",
    });
  };
  return Membership;
};
