"use strict";
module.exports = (sequelize, DataTypes) => {
  const Club = sequelize.define(
    "Club",
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "User",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      driver: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      wood3: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      wood5: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      iron4: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      iron5: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      iron6: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      iron7: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      iron8: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      iron9: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      pitchingWedge: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      wedge52: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      wedge56: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      wedge60: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      putter: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      gapWedge: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      sandWedge: {
        type: DataTypes.INTEGER,
        default: 0,
      },
      lobWedge: {
        type: DataTypes.INTEGER,
        default: 0,
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
    {
      defaultScope: {
        attributes: {
          exclude: ["createdAt", "updatedAt"],
        },
      },
    },
  );
  Club.associate = function (models) {
    Club.belongsTo(models.User, {
      as: "User",
      foreignKey: "userId",
    });
  };

  return Club;
};
