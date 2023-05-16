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
        allowNull: false,
      },
      content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      timings: {
        type: DataTypes.JSON,
        allowNull: false,
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
    models.Career.belongsTo(models.Organization, { foreignKey: "orgId" });
    models.Career.belongsTo(models.Course, { foreignKey: "gcId" });
    models.Career.hasMany(models.Contact_Career, {
      as: "Contact_Careers",
      foreignKey: "careerId",
    });
  };
  return Career;
};
