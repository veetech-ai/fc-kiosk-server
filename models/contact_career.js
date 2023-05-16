"use strict";
module.exports = (sequelize, DataTypes) => {
  const Contact_Career = sequelize.define(
    "Contact_Career",
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
      careerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Careers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      contactMedium: {
        type: DataTypes.ENUM("text", "call"),
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
  Contact_Career.associate = function (models) {
    // associations can be defined here
    models.Contact_Career.belongsTo(models.Organization, {
      foreignKey: "orgId",
    });
    models.Contact_Career.belongsTo(models.Course, { foreignKey: "gcId" });
    models.Contact_Career.belongsTo(models.Career, { foreignKey: "careerId" });
  };

  return Contact_Career;
};
