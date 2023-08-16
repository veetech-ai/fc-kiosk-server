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
    signature: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    createdAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
    updatedAt: {
      allowNull: false,
      type: DataTypes.DATE,
    },
  });
  SignedWaiver.associate = function (models) {
    models.Signed_Waiver.hasMany(models.Waiver, {
      foreignKey: "waiverId",
    });
  };
  return SignedWaiver;
};
