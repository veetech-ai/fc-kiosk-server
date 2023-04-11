"use strict";
module.exports = (sequelize, DataTypes) => {
  const Device_History = sequelize.define(
    "Device_History",
    {
      action_from: DataTypes.STRING,
      action: {
        type: DataTypes.JSON,
        get() {
          return JSON.parse(this.getDataValue("action"));
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("action", value);
          } catch (e) {
            this.setDataValue("action", JSON.stringify(value));
          }
        },
      },
      device_id: DataTypes.INTEGER,
      performedActionsKeys: {
        type: DataTypes.JSON,
        field: "performed_actions_keys",
        allowNull: false,
        defaultValue: "[]",
        get() {
          return JSON.parse(this.getDataValue("performedActionsKeys")) || [];
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("performedActionsKeys", value);
          } catch (e) {
            this.setDataValue("performedActionsKeys", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  Device_History.associate = function (models) {
    // associations can be defined here
  };
  return Device_History;
};
