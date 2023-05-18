const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const { Sequelize } = require("sequelize");

const Feedback = models.Feedback;

async function createFeedback(reqBody) {
  const feedback = await Feedback.create({ ...reqBody });
  return feedback;
}

async function getCourseFeedBacks(courseId) {
  const feedbacks = await Feedback.findAll({ where: { gcId: courseId } });
  if (!feedbacks) {
    throw new ServiceError("Not found", 404);
  }
  return feedbacks;
}

async function getAverageRating(courseId) {
  // Fetch the average rating
  const result = await Feedback.findAll({
    where: { gcId: courseId },
    attributes: [[Sequelize.fn("avg", Sequelize.col("rating")), "avgRating"]],
  });

  // If no feedback found, throw an error
  if (!result) {
    throw new ServiceError("Not found", 404);
  }
  let averageRating = result[0].dataValues.avgRating;

  // Format averageRating to two decimal places
  averageRating = parseFloat(averageRating).toFixed(2);

  // Return the average rating
  return averageRating;
}

async function getFeedBackById(feedbackId) {
  const result = await Feedback.findOne({
    where: { id: feedbackId },
  });

  if (!result) {
    throw new ServiceError("Not found", 404);
  }

  return result;
}

async function updateFeedBackIsAddressable(feedbackId, isAddressedBoolean) {
  const [affectedRows] = await Feedback.update(
    { isAddressed: isAddressedBoolean },
    { where: { id: feedbackId } },
  );

  return affectedRows;
}

module.exports = {
  createFeedback,
  getCourseFeedBacks,
  getAverageRating,
  getFeedBackById,
  updateFeedBackIsAddressable,
};
