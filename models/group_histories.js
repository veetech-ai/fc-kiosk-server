"use strict";
module.exports = (sequelize, DataTypes) => {
  const Group_Histories = sequelize.define(
    "Group_Histories",
    {
      group_id: DataTypes.INTEGER,
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
      action_from: DataTypes.STRING,
    },
    {},
  );
  Group_Histories.associate = function (models) {
    // associations can be defined here
  };
  return Group_Histories;
};
