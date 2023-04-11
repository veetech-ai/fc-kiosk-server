"use strict";

module.exports = (sequelize, DataTypes) => {
  const Device_Diagnostics = sequelize.define(
    "Device_Diagnostics",
    {
      deviceId: {
        allowNull: false,
        type: DataTypes.INTEGER,
        field: "device_id",
      },
      batteryCharging: {
        type: DataTypes.BOOLEAN,
        field: "battery_charging",
      },
      batteryCharged: {
        type: DataTypes.BOOLEAN,
        field: "battery_charged",
      },
      encoder_miss: DataTypes.BOOLEAN,
      home_miss: DataTypes.BOOLEAN,
      h_bridge_fault: DataTypes.BOOLEAN,
      over_current: DataTypes.BOOLEAN,
      vbatAlert: {
        type: DataTypes.BOOLEAN,
        field: "vbat_alert",
      },
      encoder_timeout: DataTypes.BOOLEAN,
      motor_missing: DataTypes.BOOLEAN,
      noCharging: {
        type: DataTypes.BOOLEAN,
        field: "no_charging",
      },
      last_hexa: DataTypes.STRING,
      rfidIoError: {
        type: DataTypes.BOOLEAN,
        field: "rfid_io_error",
      },
      rfidIoErrorUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "rfid_io_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      rfidIoWarning: {
        type: DataTypes.BOOLEAN,
        field: "rfid_io_warning",
      },
      rfidIoWarningUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "rfid_io_warning_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      frontendConnectionError: {
        type: DataTypes.BOOLEAN,
        field: "frontend_connection_error",
      },
      frontendConnectionErrorUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "frontend_connection_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      motorIo: {
        type: DataTypes.BOOLEAN,
        field: "motor_io",
      },
      motorIoUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "motor_io_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      cteuReconnectError: {
        type: DataTypes.BOOLEAN,
        field: "cteu_reconnect_error",
      },
      cteuReconnectErrorUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "cteu_reconnect_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      cteuIpError: {
        type: DataTypes.BOOLEAN,
        field: "cteu_ip_error",
      },
      cteuIpErrorUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "cteu_ip_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      barcode: {
        type: DataTypes.BOOLEAN,
        field: "barcode_error",
      },
      barcodeUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "barcode_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      UHFIOError: {
        type: DataTypes.BOOLEAN,
        field: "UHF_IO_error",
      },
      UHFIOErrorUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "UHF_IO_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      badgeReaderIoError: {
        type: DataTypes.BOOLEAN,
        field: "badgeReaderIo_error",
      },
      badgeReaderIoErrorUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "badgeReaderIo_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      dscope: {
        type: DataTypes.BOOLEAN,
        field: "dscope_error",
      },
      dscopeUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "dscope_error_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      batteryChargingUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "battery_charging_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      batteryChargedUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "battery_charged_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      noChargingUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "no_charging_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
      vbatAlertUpdatedAt: {
        type: DataTypes.DATE(6),
        field: "vbat_alert_updated_at",
        defaultValue: sequelize.literal("NOW()"),
      },
    },
    {},
  );
  Device_Diagnostics.associate = function (models) {
    // associations can be defined here
    models.Device_Diagnostics.belongsTo(models.Device, {
      as: "Device_Diagnostics",
      foreignKey: "device_id",
    });
  };
  return Device_Diagnostics;
};
