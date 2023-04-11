"use strict";
module.exports = (sequelize, DataTypes) => {
  const Station = sequelize.define(
    "Station",
    {
      stationId: DataTypes.INTEGER,
      name: DataTypes.STRING,
      posx: DataTypes.INTEGER,
      posy: DataTypes.INTEGER,
      operatorId: DataTypes.INTEGER,
      operatorName: DataTypes.STRING,
      operatorLoginTime: DataTypes.DATE,
      nextStations: {
        type: DataTypes.JSON,
      },
      other: DataTypes.JSON,
      trolleyIds: {
        type: DataTypes.JSON,
        get() {
          const rawValue = this.getDataValue("trolleyIds");
          if (typeof rawValue === "string") {
            return JSON.parse(rawValue);
          }
          return rawValue;
        },
      },
      exitTrolleyIds: {
        type: DataTypes.JSON,
      },
      barcode: DataTypes.STRING,
      enterTsm: DataTypes.DATE,
      leaveTsm: DataTypes.DATE,
      active: DataTypes.BOOLEAN,
      level: DataTypes.INTEGER,
    },
    {},
  );
  Station.associate = function (models) {
    // associations can be defined here
    models.Station.hasMany(models.Trolley, {
      as: "trolleys",
      sourceKey: "stationId",
    });
    models.Station.hasOne(models.Device, {
      foreignKey: "id",
      sourceKey: "stationId",
    });
  };
  return Station;
};
