"use strict";
module.exports = (sequelize, DataTypes) => {
  const Feedback = sequelize.define(
    "Feedback",
    {
      gc_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      contact_medium: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {},
  );
  Feedback.associate = function (models) {
    // associations can be defined here
    Feedback.belongsTo(models.Organization, { foreignKey: "org_id" });
    Feedback.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return Feedback;
};
