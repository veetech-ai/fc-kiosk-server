"use strict";
module.exports = (sequelize, DataTypes) => {
  const Configurations = sequelize.define(
    "Configurations",
    {
      config: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("config"));
            return JSON.parse(this.getDataValue("config"));
          } catch (e) {
            return this.getDataValue("config");
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("config", value);
          } catch (e) {
            this.setDataValue("config", JSON.stringify(value));
          }
        },
      },
      orgId: { type: DataTypes.INTEGER, allowNull: true },
    },
    {},
  );
  Configurations.associate = function (models) {
    // associations can be defined here
  };
  return Configurations;
};
