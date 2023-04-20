"use strict";
module.exports = (sequelize, DataTypes) => {
  const Career = sequelize.define(
    "Career",
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
      title: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      timings: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING,
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
  Career.associate = function (models) {
    // associations can be defined here
    models.Career.belongsTo(models.Organization, { foreignKey: "org_id" });
    models.Career.belongsTo(models.Course, { foreignKey: "gc_id" });
    models.Career.hasMany(models.ContactCareer, {
      as: "ContactCareers",
      foreignKey: "career_id",
    });
  };
  return Career;
};
