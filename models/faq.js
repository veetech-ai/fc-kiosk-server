"use strict";
module.exports = (sequelize, DataTypes) => {
  const FAQ = sequelize.define(
    "FAQ",
    {
      question: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      answer: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gc_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Course",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      org_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organization",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
    },
    {},
  );
  FAQ.associate = function (models) {
    // associations can be defined here
    FAQ.belongsTo(models.Organization, { foreignKey: "orgId" });
    FAQ.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return FAQ;
};
