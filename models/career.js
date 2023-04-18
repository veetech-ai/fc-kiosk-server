"use strict";
module.exports = (sequelize, DataTypes) => {
  const Career = sequelize.define(
    "Career",
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
      org_id: {
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
      timmings: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      link: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      createdAt: "createdAt",
      updatedAt: "updatedAt",
    },
  );
  Career.associate = function (models) {
    // associations can be defined here
    Career.belongsTo(models.Organization, { foreignKey: "org_id" });
    Career.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return Career;
};
