"use strict";
module.exports = (sequelize, DataTypes) => {
  const Ad = sequelize.define(
    "Ad",
    {
      smallImage: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      bigImage: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      tapLink: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      title: {
        type: DataTypes.STRING,
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
    {
      validate: {
        tapLinkAndBigImageNotNullAndNotAtSameTime() {
          let hasBigImage = this.bigImage;
          let hasTapLink = this.tapLink;
          if (hasBigImage === "null") {
            hasBigImage = JSON.parse(hasBigImage);
          }
          if (hasTapLink === "null") {
            hasTapLink = JSON.parse(hasTapLink);
          }
          if (hasBigImage && hasTapLink) {
            throw new Error(
              "Both bigImage and tapLink cannot be populated at the same time.",
            );
          }

          if (!hasBigImage && !hasTapLink) {
            throw new Error(
              "Both bigImage and tapLink cannot be null at the same time. At least one must be populated.",
            );
          }
        },
      },
    },
  );
  Ad.associate = function (models) {
    // associations can be defined here
    Ad.hasMany(models.Course_Ad);
  };
  return Ad;
};
