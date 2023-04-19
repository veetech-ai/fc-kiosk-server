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
        field:'course_info'
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      coupons: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      lessons: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      statistics: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      memberships: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      feedback: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      careers: {
        type: DataTypes.BOOLEAN,
        allowNull: true,
      },
      shop: {
        type: DataTypes.BOOLEAN,
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
  ScreenConfig.associate = function (models) {
    // associations can be defined here
    ScreenConfig.belongsTo(models.Organization, { foreignKey: "org_id" });
    ScreenConfig.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return ScreenConfig;
};
