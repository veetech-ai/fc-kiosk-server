const models = require("../models");
const smsLogsModel = models.SMS_Logs;
const SequelizeC = require("sequelize");
const Op = SequelizeC.Op;

exports.get = async (filters) => {
  const query = {};
  query.where = {};

  if (filters.from) query.where.from = filters.from;
  if (filters.to) query.where.to = filters.to;
  if (filters.accountSid) query.where.accountSid = filters.accountSid;
  if (filters.sid) query.where.sid = filters.sid;
  if (filters.body) query.where.body = { [Op.like]: `%${filters.body}%` };
  if (filters.failed && (filters.failed == true || filters.failed == "true"))
    query.where.exception = { [Op.ne]: null };

  return await smsLogsModel.findAll(query);
};

exports.save = async (params) => {
  return await smsLogsModel.create(params);
};
