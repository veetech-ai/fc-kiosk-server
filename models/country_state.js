"use strict";
module.exports = (sequelize, DataTypes) => {
  const CountryState = sequelize.define(
    "CountryState",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: true,
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
  CountryState.associate = function (models) {
    // associations can be defined here
  };
  return CountryState;
};
