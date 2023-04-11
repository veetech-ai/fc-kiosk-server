"use strict";
module.exports = (sequelize, DataTypes) => {
  const Push_Notifications_Subscriptions = sequelize.define(
    "Push_Notifications_Subscriptions",
    {
      user_id: DataTypes.INTEGER,
      status: DataTypes.BOOLEAN,
      subscription: {
        type: DataTypes.JSON,
        get() {
          try {
            JSON.parse(this.getDataValue("subscription"));
            return JSON.parse(this.getDataValue("subscription"));
          } catch (e) {
            return null;
          }
        },
        set(value) {
          try {
            JSON.parse(value);
            this.setDataValue("subscription", value);
          } catch (e) {
            this.setDataValue("subscription", JSON.stringify(value));
          }
        },
      },
    },
    {},
  );
  Push_Notifications_Subscriptions.associate = function (models) {
    // associations can be defined here
    models.Push_Notifications_Subscriptions.belongsTo(models.User, {
      as: "User",
      foreignKey: "user_id",
    });
  };
  return Push_Notifications_Subscriptions;
};
