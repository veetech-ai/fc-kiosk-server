"use strict";
module.exports = (sequelize, DataTypes) => {
  const ScreenConfig = sequelize.define(
    "ScreenConfig",
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
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      courseInfo: {
        field: "course_info",
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      coupons: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      lessons: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      statistics: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      memberships: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      feedback: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      careers: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      shop: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
  ScreenConfig.associate = function (models) {
    // associations can be defined here
    ScreenConfig.belongsTo(models.Organization, { foreignKey: "org_id" });
    ScreenConfig.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return ScreenConfig;
};
