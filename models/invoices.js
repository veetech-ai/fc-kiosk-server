"use strict";
module.exports = (sequelize, DataTypes) => {
  const Invoices = sequelize.define(
    "Invoices",
    {
      user_id: DataTypes.INTEGER,
      issue_date: DataTypes.DATE,
      due_date: DataTypes.DATE,
      status: DataTypes.INTEGER,
      issue_notice: DataTypes.BOOLEAN,
      expire_notice: DataTypes.BOOLEAN,
    },
    {},
  );
  Invoices.associate = function (models) {
    // associations can be defined here
    models.Invoices.hasMany(models.Invoice_Items, {
      as: "Invoice_Items",
      foreignKey: "invoice_id",
    });
    models.Invoices.belongsTo(models.User, {
      as: "User",
      foreignKey: "user_id",
    });
  };
  return Invoices;
};
