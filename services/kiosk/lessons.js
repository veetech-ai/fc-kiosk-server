const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Coach = models.Coach;

async function createCoach(reqBody, gcId, orgId) {
  const coach = await Coach.create({
    ...reqBody,
    gcId,
    orgId,
  });
  if (!coach) {
    throw new ServiceError("Something Went wrong", 401);
  }
  return Coach;
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
};
