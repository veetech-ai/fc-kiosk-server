const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Coach = models.Coach;
const Course = models.Course;

async function createCoach(reqBody, orgId) {
  const coach = await Coach.create({
    ...reqBody,
    orgId,
  });
  if (!coach) {
    throw new ServiceError("Something Went wrong", 401);
  }
  return coach;
}
async function findLessonById(lessonId) {
  const lesson = await Coach.findOne({
    where: { id: lessonId },
  });
  if (!lesson) {
    throw new ServiceError("Something Went wrong", 401);
  }
  return lesson;
}
async function updateCoach(reqBody, lessonId) {
  const updatedCoach = await Coach.update(
    {
      ...reqBody,
    },
    { where: { id: lessonId } },
  );
  if (!updatedCoach[0]) {
    throw new ServiceError("Something Went wrong", 401);
  }
  return updatedCoach;
}
module.exports = {
  createCoach,
  updateCoach,
  findLessonById,
};
