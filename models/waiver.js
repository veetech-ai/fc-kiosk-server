"use strict";

module.exports = (sequelize, DataTypes) => {
  const Waiver = sequelize.define("Waiver", {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT("medium"),
      allowNull: false,
    },
    gcId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
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
  Waiver.associate = function (models) {
    models.Waiver.hasMany(models.Signed_Waiver, {
      foreignKey: "waiverId",
    });

    models.Waiver.belongsTo(models.Course, {
      foreignKey: "gcId",
    });
  };
  return Waiver;
};
