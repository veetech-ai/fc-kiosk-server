"use strict";
module.exports = (sequelize, DataTypes) => {
  const EventModel = sequelize.define("Event", {
    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    openingTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    closingTime: {
      type: DataTypes.TIME,
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    corousal: {
      type: DataTypes.JSON,
      allowNull: true,
      description: "Array of URLs/filenames of images",
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    details: {
      // There's open discussion here: whether to use VARCHAR(255), MEDIUMTEXT or LONGTEXT
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
      description: "A rich text log description in HTML format",
    },
    gcId: {
      field: "gcId",
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Mobile_Courses",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  });

  EventModel.associate = function (models) {
    EventModel.belongsTo(models.Mobile_Course, {
      as: "Mobile_Courses",
      foreignKey: "gcId",
    });
  };
  return EventModel;
};