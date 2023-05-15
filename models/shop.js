"use strict";
module.exports = (sequelize, DataTypes) => {
  const Shop = sequelize.define(
    "Shop",
    {
      gcId: {
        field: "gc_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Courses",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      orgId: {
        field: "org_id",
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Organizations",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      subheading: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {},
  );
  Shop.associate = function (models) {
    // associations can be defined here
    Shop.belongsTo(models.Organization, { foreignKey: "org_id" });
    Shop.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return Shop;
};
