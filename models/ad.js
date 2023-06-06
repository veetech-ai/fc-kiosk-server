"use strict";
module.exports = (sequelize, DataTypes) => {
  const Ad = sequelize.define(
    "Ad",
    {
      gcId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
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
        validate: {
          isUrl: true,
        },
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
    {
      validate: {
        tapLinkAndBigImageNotNullAndNotAtSameTime() {
          const hasBigImage = this.bigImage;
          const hasTapLink = this.tapLink;
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
    Ad.belongsTo(models.Mobile_Course, { foreignKey: "gcId" });
  };
  return Ad;
};
