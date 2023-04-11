"use strict";
module.exports = (sequelize, DataTypes) => {
  const Transactions_Attachments = sequelize.define(
    "Transactions_Attachments",
    {
      session_id: DataTypes.INTEGER,
      type: DataTypes.STRING,
      filename: DataTypes.STRING,
      host: DataTypes.STRING,
      path: DataTypes.STRING,
      title: DataTypes.STRING,
      url: DataTypes.STRING,
      cdn_url: DataTypes.STRING,
    },
    {},
  );
  Transactions_Attachments.associate = function (models) {
    // associations can be defined here
    models.Transactions_Attachments.belongsTo(models.Transactions, {
      as: "Transactions",
      foreignKey: "session_id",
    });
  };
  return Transactions_Attachments;
};
