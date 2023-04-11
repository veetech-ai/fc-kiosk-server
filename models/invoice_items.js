"use strict";
module.exports = (sequelize, DataTypes) => {
  const Invoice_Items = sequelize.define(
    "Invoice_Items",
    {
      device_id: DataTypes.INTEGER,
      user_id: DataTypes.INTEGER,
      invoice_id: DataTypes.INTEGER,
      issue_date: DataTypes.DATEONLY,
      due_date: DataTypes.DATEONLY,
      one_time_amount: DataTypes.DOUBLE,
      bill_amount: DataTypes.DOUBLE,
      installment_amount: DataTypes.DOUBLE,
      total_amount: DataTypes.DOUBLE,
      status: DataTypes.INTEGER,
    },
    {},
  );
  Invoice_Items.associate = function (models) {
    // associations can be defined here
    models.Invoice_Items.belongsTo(models.Invoices, {
      as: "Invoice",
      foreignKey: "invoice_id",
    });
    models.Invoice_Items.belongsTo(models.Device, {
      as: "Device",
      foreignKey: "device_id",
    });
  };
  return Invoice_Items;
};
