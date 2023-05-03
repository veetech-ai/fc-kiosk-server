"use strict";

module.exports = (sequelize, DataTypes) => {
  const Role = sequelize.define(
    "Role",
    {
      title: DataTypes.STRING,
      manageUsers: {
        type: DataTypes.BOOLEAN,
        field: "manage_users",
      },
      super: {
        type: DataTypes.BOOLEAN,
        field: "super",
      },
      admin: {
        type: DataTypes.BOOLEAN,
        field: "admin",
      },
      getUsers: {
        type: DataTypes.BOOLEAN,
        field: "get_users",
      },
      manageDevices: {
        type: DataTypes.BOOLEAN,
        field: "manage_devices",
      },
      getDevices: {
        type: DataTypes.BOOLEAN,
        field: "get_devices",
      },
      ceo: {
        type: DataTypes.BOOLEAN,
        field: "ceo",
      },
      getLogs: {
        type: DataTypes.BOOLEAN,
        field: "get_logs",
      },
      manageLogs: {
        type: DataTypes.BOOLEAN,
        field: "manage_logs",
      },
      getKpis: {
        type: DataTypes.BOOLEAN,
        field: "get_kpis",
      },
      manageKpis: {
        type: DataTypes.BOOLEAN,
        field: "manage_kpis",
      },
      getOrganization: {
        type: DataTypes.BOOLEAN,
        field: "get_organization",
      },
      manageOrganization: {
        type: DataTypes.BOOLEAN,
        field: "manage_organization",
      },
      createdAt: {
        type: DataTypes.DATE,
        field: "created_at",
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
        field: "updated_at",
      },
      manageSchedules: {
        type: DataTypes.BOOLEAN,
        field: "manage_schedules",
      },
      getSchedules: {
        type: DataTypes.BOOLEAN,
        field: "get_schedules",
      },
      manageGroups: {
        type: DataTypes.BOOLEAN,
        field: "manage_groups",
      },
      getGroups: {
        type: DataTypes.BOOLEAN,
        field: "get_groups",
      },
      getRoles: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "get_roles",
      },
      getCourses: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "get_courses",
      },
      manageCourses: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: "manage_courses",
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
  Role.associate = function (models) {};
  return Role;
};
