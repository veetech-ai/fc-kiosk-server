"use strict";
module.exports = (sequelize, DataTypes) => {
  const CountryState = sequelize.define(
    "CountryState",
    {
      name: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {},
  );

  return CountryState;
};
