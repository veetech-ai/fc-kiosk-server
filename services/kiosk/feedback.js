const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const Course = models.Course;
const Feedback = models.Feedback;
const Organization = models.Organization;

async function createFeedback(reqBody) {
  const feedback = await Feedback.create({ ...reqBody });
  console.log("feddback :", feedback);
  return feedback;
}
module.exports = {
  createFeedback,
};
