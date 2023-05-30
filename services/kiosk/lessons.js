const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Coach = models.Coach;
const upload_file = require("../../common/upload");

async function createLesson(reqBody, orgId) {
  const coach = await Coach.create({
    ...reqBody,
    orgId,
  });
  if (!coach) {
    throw new ServiceError("Something Went wrong", 400);
  }
  if (coach?.image) {
    const image = upload_file.getFileURL(coach.image);
    coach.image = image;
  }
  return coach;
}
async function findLessonById(where, loggedInUserOrg) {
  let clonedWhere = { ...where };
  if (loggedInUserOrg) clonedWhere.orgId = loggedInUserOrg;
  const lesson = await Coach.findOne({
    where: clonedWhere,
  });
  if (!lesson) {
    throw new ServiceError("Not found", 404);
  }
  if (lesson?.image) {
    const image = upload_file.getFileURL(lesson.image);
    lesson.image = image;
  }
  return lesson;
}
async function updateLesson(reqBody, lessonId) {
  const [affectedRows] = await Coach.update(
    {
      ...reqBody,
    },
    { where: { id: lessonId } },
  );

  return affectedRows;
}
async function findLessonsByCourseId(courseId) {
  const lessons = await Coach.findAll({
    where: { gcId: courseId },
  });
  if (lessons.length) {
    lessons.forEach((lesson) => {
      if (!lesson?.image) return;
      const image = upload_file.getFileURL(lesson.image);
      lesson.image = image;
    });
  }
  return lessons;
}
async function deleteLessonById(lessonId) {
  const deletedCoach = await Coach.destroy({
    where: { id: lessonId },
  });
  if (deletedCoach === 0) {
    throw new ServiceError("Something Went wrong", 400);
  }
  return deletedCoach;
}
module.exports = {
  createLesson,
  updateLesson,
  findLessonById,
  findLessonsByCourseId,
  deleteLessonById,
};
