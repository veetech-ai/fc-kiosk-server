"use strict";

module.exports = (sequelize, DataTypes) => {
  const Waiver = sequelize.define("Waiver", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.literal("CURRENT_TIMESTAMP"),
      onUpdate: DataTypes.literal("CURRENT_TIMESTAMP"),
    },
  });
  Waiver.associate = function (models) {
    models.Waiver.belongsTo(models.SignedWaiver, {
      foreignKey: "waiverId",
    });
  };
  return Waiver;
};
