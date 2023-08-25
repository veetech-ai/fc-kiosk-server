"use strict";

module.exports = (sequelize, DataTypes) => {
  const SignedWaiver = sequelize.define("Signed_Waiver", {
    waiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Waivers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    phone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
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
    models.Signed_Waiver.belongsTo(models.Waiver, {
      foreignKey: "waiverId",
    });
  };
  return SignedWaiver;
};
