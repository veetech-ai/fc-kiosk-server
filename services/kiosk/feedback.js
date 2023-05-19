const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const { Sequelize } = require("sequelize");

const Feedback = models.Feedback;

async function createFeedback(reqBody) {
  const feedback = await Feedback.create({ ...reqBody });
  return feedback;
}

async function getCourseFeedBacks(courseId) {
  const feedbacks = await Feedback.findAll({
    where: { gcId: courseId },
    attributes: { exclude: ["gc_id", "org_id"] },
  });

  return feedbacks;
}

async function getAverageRating(courseId) {
  // Fetch the average rating
  const result = await Feedback.findAll({
    where: { gcId: courseId },
    attributes: [
      [Sequelize.fn("avg", Sequelize.col("rating")), "avgRating"],
      [Sequelize.fn("count", Sequelize.col("rating")), "totalRating"],
    ],
  });

  const response = { averageRating: 0, totalRating: 0 };

  if (result.length) {
    response.averageRating =
      result[0]?.dataValues?.avgRating || response.averageRating;
    response.averageRating = +parseFloat(response.averageRating).toFixed(2);
    response.totalRating =
      result[0]?.dataValues?.totalRating || response.totalRating;
  }

  return response;
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

async function getFeedBackDetails(courseId) {
  const feedbacksDistribution = await Feedback.findAll({
    where: { gcId: courseId },
    attributes: [
      [
        Sequelize.fn(
          "count",
          Sequelize.literal(`CASE WHEN rating = 1 THEN 1 END`),
        ),
        "One",
      ],
      [
        Sequelize.fn(
          "count",
          Sequelize.literal(`CASE WHEN rating = 2 THEN 1 END`),
        ),
        "two",
      ],
      [
        Sequelize.fn(
          "count",
          Sequelize.literal(`CASE WHEN rating = 3 THEN 1 END`),
        ),
        "three",
      ],
      [
        Sequelize.fn(
          "count",
          Sequelize.literal(`CASE WHEN rating = 4 THEN 1 END`),
        ),
        "four",
      ],
      [
        Sequelize.fn(
          "count",
          Sequelize.literal(`CASE WHEN rating = 5 THEN 1 END`),
        ),
        "five",
      ],
    ],
    group: ["gc_id"],
  });
  const averageAndTotalRatings = await getAverageRating(courseId);
  const result = {
    ...feedbacksDistribution[0].dataValues,
    ...averageAndTotalRatings,
  };
  return result;
}

module.exports = {
  createFeedback,
  getCourseFeedBacks,
  getAverageRating,
  getFeedBackById,
  updateFeedBackIsAddressable,
  getFeedBackDetails,
};
