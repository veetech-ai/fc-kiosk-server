"use strict";
module.exports = (sequelize, DataTypes) => {
  const Statistic = sequelize.define(
    "Statistic",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      rounds: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      putt: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      avgGirPercentage: {
        type: DataTypes.FLOAT,
        allowNull: true,
      },
      bestScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      worstScore: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      bestScoreRelativeToPar: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      worstScoreRelativeToPar: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      avg: {
        type: DataTypes.FLOAT,
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
  Statistic.associate = function (models) {
    // associations can be defined here
    Statistic.belongsTo(models.User, {
      as: "User",
      foreignKey: "userId",
    });
  };
  return Statistic;
};
