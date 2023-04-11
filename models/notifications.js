"use strict";
module.exports = (sequelize, DataTypes) => {
  const Notifications = sequelize.define(
    "Notifications",
    {
      notice: DataTypes.STRING,
      type: DataTypes.STRING,
      read_at: DataTypes.DATE,
      user_id: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      misc: {
        type: DataTypes.JSON,
        get() {
          return this.getDataValue("misc")
            ? JSON.parse(this.getDataValue("misc"))
            : null;
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("misc", value);
          } catch (e) {
            this.setDataValue("misc", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  Notifications.associate = function (models) {
    // associations can be defined here
  };
  return Notifications;
};
