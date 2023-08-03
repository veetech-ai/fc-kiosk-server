"use strict";
module.exports = (sequelize, DataTypes) => {
  const Mobile_Course = sequelize.define(
    "Mobile_Course",
    {
      golfbertId: {
        field: "golfbert_id",
        type: DataTypes.INTEGER,
        unique: true,
        allowNull: true,
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: DataTypes.STRING,
      phone: DataTypes.STRING,
      country: DataTypes.STRING,
      street: DataTypes.STRING,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      zip: DataTypes.STRING,
      lat: DataTypes.DOUBLE,
      long: DataTypes.DOUBLE,

      createdAt: {
        field: "created_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        field: "updated_at",
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {},
  );
  Mobile_Course.associate = function (models) {
    // associations can be defined here
    Mobile_Course.hasMany(models.Game, {
      as: "Games",
      foreignKey: "gcId",
    });
    Mobile_Course.hasMany(models.Hole, {
      as: "Holes",
      foreignKey: "gcId",
    });
    Mobile_Course.hasMany(models.Course_Ad, {
      as: "Course_Ads",
      foreignKey: "gcId",
    });
    Mobile_Course.hasMany(models.Course_Ad, {
      as: "Course_Ads",
      foreignKey: "gcId",
    });
  };
  return Mobile_Course;
};
