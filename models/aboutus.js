"use strict";
module.exports = (sequelize, DataTypes) => {
  const AboutUs = sequelize.define(
    "AboutUs",
    {
      content: {
        type: DataTypes.TEXT,
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
  return AboutUs;
};
