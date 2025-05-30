"use strict";

const ServiceError = require("../utils/serviceError");
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
        allowNull: true,
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("timings", value);
          } catch (error) {
            throw new ServiceError(
              "Set: The timings field format is invalid",
              400,
            );
          }
        },
        get() {
          return JSON.parse(this.getDataValue("timings") || null);
        },
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
