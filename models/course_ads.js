"use strict";
module.exports = (sequelize, DataTypes) => {
  const CourseAds = sequelize.define(
    "Course_Ad",
    {
      gcId: {
        field: "gcId",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Course",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      adId: {
        field: "adId",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Ads",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      screens: {
        type: DataTypes.JSON,
        allowNull: false,
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
  CourseAds.associate = function (models) {
    // associations can be defined here
    CourseAds.belongsTo(models.Mobile_Course, {
      as: "Mobile_Courses",
      foreignKey: "gcId",
    });
    CourseAds.belongsTo(models.Ad, { foreignKey: "adId" });
  };
  return CourseAds;
};
