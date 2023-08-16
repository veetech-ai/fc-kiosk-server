"use strict";

module.exports = (sequelize, DataTypes) => {
  const SignedWaiver = sequelize.define("Signed_Waiver", {
    waiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Waiver",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    signatureImage: {
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
  SignedWaiver.associate = function (models) {
    models.SignedWaiver.hasMany(models.Waiver, {
      foreignKey: "waiverId",
    });
  };
  return SignedWaiver;
};
