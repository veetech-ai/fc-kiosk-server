const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const Feedback = models.Feedback;

async function createFeedback(reqBody) {
  const feedback = await Feedback.create(reqBody);

  return feedback;
}

module.exports = {
  createFeedback,
};
