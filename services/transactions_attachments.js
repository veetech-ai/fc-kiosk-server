const models = require("../models");
const Transactions_Attachments = models.Transactions_Attachments;

exports.save = async (params) => {
  return await Transactions_Attachments.create(params);
};

exports.getBySessionId = async ({ session_id, type = null }) => {
  const where = { session_id };
  if (type) where.type = type;
  return await Transactions_Attachments.findAll({ where: where });
};
