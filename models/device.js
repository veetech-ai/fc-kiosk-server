"use strict";

module.exports = (sequelize, DataTypes) => {
  const Device = sequelize.define(
    "Device",
    {
      remote_id: DataTypes.INTEGER,
      serial: DataTypes.STRING,
      mac: DataTypes.STRING,
      ssid: DataTypes.STRING,
      password: DataTypes.STRING,
      pin_code: DataTypes.STRING,
      status: DataTypes.TINYINT,
      owner_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      live_status: DataTypes.BOOLEAN,
      transfer: DataTypes.INTEGER,
      transfer_token: DataTypes.STRING,
      fi: DataTypes.BOOLEAN,
      wi: DataTypes.BOOLEAN,
      ii: DataTypes.BOOLEAN,
      fv: DataTypes.STRING,
      new_fv: DataTypes.STRING,
      lst: DataTypes.STRING,
      fv_update_state: DataTypes.INTEGER,
      stage: DataTypes.STRING,
      slack_notifications: DataTypes.BOOLEAN,
      device_type: DataTypes.INTEGER,
      parent: DataTypes.INTEGER,

      grace_period: DataTypes.INTEGER,
      trial_period: DataTypes.INTEGER,
      bill_cleared: DataTypes.BOOLEAN,
      enable_bill: DataTypes.BOOLEAN,
      sims: DataTypes.INTEGER,
      operatorId: DataTypes.INTEGER,
      operatorName: DataTypes.STRING,
      operatorLoginTime: DataTypes.DATE,
      versions: DataTypes.JSON,
      device_ip: DataTypes.JSON,
      // reg_date: DataTypes.DATE,
      // bill: DataTypes.BOOLEAN,
      // billexpiry: DataTypes.DATE,
      // billpaid: DataTypes.DATE,
      // trial_ended: DataTypes.BOOLEAN,
      // next_bill_date: DataTypes.DATEONLY,
      hw_ver: DataTypes.STRING,
      gcId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        field: "gc_id",
        references: {
          model: "Courses",
          key: "id",
        },
      },
      device_token:{
        type: DataTypes.STRING,
        allowNull:true
      },
      is_enable:{
        type:DataTypes.BOOLEAN,
        defaultValue:true
      }
    },
    {},
  );
  Device.associate = function (models) {
    models.Device.hasMany(models.Organization_Device, {
      as: "Organization_Devices",
      foreignKey: "device_id",
    });
    models.Device.hasMany(models.Organization_Device_Scheduling, {
      as: "Organization_Device_Scheduling",
      foreignKey: "device_id",
    });
    models.Device.belongsTo(models.Organization, {
      as: "Owner",
      foreignKey: "owner_id",
    });
    models.Device.hasMany(models.Organization_Device_Groups_Items, {
      as: "Organization_Device_Groups_Items",
      foreignKey: "device_id",
    });
    models.Device.hasOne(models.Organization_Device, {
      as: "DeviceName",
      foreignKey: "device_id",
    });
    models.Device.hasOne(models.Organization_Device_Groups_Items, {
      as: "Group",
      foreignKey: "device_id",
    });
    models.Device.hasOne(models.Organization_Device_settings, {
      as: "Settings",
      foreignKey: "device_id",
    });
    models.Device.hasOne(models.Device_Diagnostics, {
      as: "Device_Diagnostics",
      foreignKey: "device_id",
    });
    models.Device.hasOne(models.Device_Log_Counts, {
      as: "Log_Counts",
      foreignKey: "device_id",
    });
    models.Device.hasMany(models.Fv_Resets, {
      as: "Fv_Resets",
      foreignKey: "device_id",
    });

    models.Device.belongsTo(models.Product, {
      as: "Device_Type",
      foreignKey: "device_type",
    });

    models.Device.hasMany(models.Device, {
      as: "ChildDevices",
      foreignKey: "parent",
    });
    models.Device.hasMany(models.Transactions, {
      as: "Transactions",
      foreignKey: "device_id",
    });
    models.Device.hasMany(models.Transaction_Logs, {
      as: "Transaction_Logs",
      foreignKey: "device_id",
    });
    models.Device.belongsTo(models.Course, { foreignKey: "gc_id" });
  };
  return Device;
};
