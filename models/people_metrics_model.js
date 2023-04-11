"use strict";

module.exports = (sequelize, DataTypes) => {
  const PeopleMetricsModel = sequelize.define(
    "PeopleMetricsModel",
    {
      filePath: {
        type: DataTypes.STRING,
        field: "file_path",
      },
      userId: {
        type: DataTypes.STRING,
        field: "user_id",
      },
    },
    {},
  );
  PeopleMetricsModel.associate = function (models) {
    models.PeopleMetricsModel.belongsTo(models.User, {
      as: "User",
      foreignKey: "user_id",
      sourceKey: "id",
    });
  };
  return PeopleMetricsModel;
};
