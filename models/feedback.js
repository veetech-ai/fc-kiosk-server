"use strict";
module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback",
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
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contact_medium: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isAddressed: {
        field: "is_addressed",
        type: DataTypes.BOOLEAN,
        defaultValue: false,
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
  Feedback.associate = function (models) {
    // associations can be defined here
    Feedback.belongsTo(models.Organization, { foreignKey: "org_id" });
    Feedback.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return Feedback;
};
