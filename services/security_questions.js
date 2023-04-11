const models = require("../models");
const SecurityQuestionsModel = models.Security_Questions;

exports.list = async () => {
  return await SecurityQuestionsModel.findAll({
    attributes: ["id", "question"],
    where: { status: true },
  });
};

exports.findByWhere = async (where) => {
  return await SecurityQuestionsModel.findOne({
    where: where,
    attributes: ["id", "question"],
  });
};

exports.findByID = async (id) => {
  return await SecurityQuestionsModel.findOne({
    attributes: ["id", "question"],
    where: {
      id: id,
    },
  });
};

exports.create = async (params) => {
  return await SecurityQuestionsModel.create(params);
};

exports.update = async (id, params) => {
  return await SecurityQuestionsModel.update(params, {
    where: {
      id: id,
    },
  });
};

exports.delete = async (id) => {
  return await SecurityQuestionsModel.destroy({
    where: {
      id: id,
    },
  });
};
