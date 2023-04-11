"use strict";
module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    "Schedule",
    {
      name: DataTypes.STRING,
      description: DataTypes.STRING,
      schedule: {
        type: DataTypes.JSON,
        get() {
          return JSON.parse(this.getDataValue("schedule"));
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("schedule", value);
          } catch (e) {
            this.setDataValue("schedule", JSON.stringify(value));
          }
        },
      },
      status: DataTypes.BOOLEAN,
      orgId: { type: DataTypes.INTEGER, allowNull: true },
      admin_created: DataTypes.BOOLEAN,
      mqtt_token: DataTypes.STRING,
    },
    {},
  );
  Schedule.associate = function (models) {
    Schedule.belongsTo(models.Organization, {
      as: "Organization",
      foreignKey: "orgId",
    });
    // associations can be defined here
  };
  return Schedule;
};
