"use strict";
module.exports = (sequelize, DataTypes) => {
  const Coach = sequelize.define(
    "Coach",
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
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timings: {
        type: DataTypes.JSON,
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
  Coach.associate = function (models) {
    // associations can be defined here
    Coach.belongsTo(models.Organization, { foreignKey: "org_id" });
    Coach.belongsTo(models.Course, { foreignKey: "gc_id" });
    Coach.hasMany(models.ContactCoach, {
      as: "ContactCoaches",
      foreignKey: "coach_id",
    });
  };
  return Coach;
};