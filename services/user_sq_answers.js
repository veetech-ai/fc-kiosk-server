const models = require("../models");

const User_SQ_Answers = models.User_SQ_Answers;
const SQ = models.Security_Questions;

exports.findByUserID = async (user_id) => {
  return await User_SQ_Answers.findAll({
    where: { user_id: user_id },
    attributes: ["id", "question_id", "answer", "answer_number"],
    include: [
      {
        as: "SQ",
        model: models.Security_Questions,
        attributes: ["id", "question"],
        required: false,
      },
    ],
  });
};

exports.findByUserIDWithoutAnswer = async (user_id) => {
  return await SQ.findAll({
    attributes: ["id", "question"],
    include: [
      {
        as: "SQ_Answers",
        model: models.User_SQ_Answers,
        where: { user_id: user_id },
        attributes: [],
        required: true,
      },
    ],
  });
};

exports.save = async (params) => {
  const query = await User_SQ_Answers.findOne({
    where: { user_id: params.user_id, answer_number: params.answer_number },
  });

  if (query)
    return await User_SQ_Answers.update(params, {
      where: {
        user_id: params.user_id,
        answer_number: params.answer_number,
      },
    });
  else return await User_SQ_Answers.create(params);
};

exports.validate = async (params) => {
  return await User_SQ_Answers.findOne({
    where: {
      user_id: params.user_id,
      answer: params.answer,
      question_id: params.question_id,
    },
  });
};
