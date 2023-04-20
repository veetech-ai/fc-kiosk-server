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
  CountryState.associate = function (models) {
    models.CountryState.hasMany(models.Ad, {
      as: "Ads",
      foreignKey: "state_id",
    });
  };
  return CountryState;
};
