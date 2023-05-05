"use strict";
module.exports = (sequelize, DataTypes) => {
  const Screen_Config = sequelize.define(
    "Screen_Config",
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
      faq: {
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
  Screen_Config.associate = function (models) {
    // associations can be defined here
    Screen_Config.belongsTo(models.Organization, { foreignKey: "org_id" });
    Screen_Config.belongsTo(models.Course, { foreignKey: "gc_id" });
  };

  return Screen_Config;
};
