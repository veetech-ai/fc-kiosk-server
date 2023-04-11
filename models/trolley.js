"use strict";
module.exports = (sequelize, DataTypes) => {
  const Trolley = sequelize.define(
    "Trolley",
    {
      trolleyId: DataTypes.INTEGER,
      tsm: DataTypes.DATE,
      stationId: DataTypes.INTEGER,
      lastStationId: DataTypes.INTEGER,
      nextStationId: DataTypes.INTEGER,
      barcode: DataTypes.STRING,
      product: DataTypes.STRING,
    },
    {},
  );
  Trolley.associate = function (models) {
    // associations can be defined here
    models.Trolley.belongsTo(models.Station, { foreignKey: "stationId" });
  };
  return Trolley;
};
