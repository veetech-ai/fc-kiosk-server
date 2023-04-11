"use strict";
module.exports = (sequelize, DataTypes) => {
  const org_user_rel_fp_user = sequelize.define(
    "org_user_rel_fp_user",
    {
      user_id: DataTypes.INTEGER,
      device_id: DataTypes.INTEGER,
      orgId: DataTypes.INTEGER,
      device_user_id: DataTypes.INTEGER,
    },
    {},
  );
  org_user_rel_fp_user.associate = function (models) {
    // associations can be defined here
    models.org_user_rel_fp_user.hasOne(models.User, {
      as: "Users",
      foreignKey: "id",
      sourceKey: "user_id",
    });
  };
  return org_user_rel_fp_user;
};
