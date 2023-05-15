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
  if (!lesson?.image) return;
  const image = upload_file.getFileURL(lesson.image);
  lesson.image = image;
  return lesson;
}
async function updateLesson(reqBody, lessonId) {
  const [affectedRows] = await Coach.update(
    {
      ...reqBody,
    },
    { where: { id: lessonId } },
  );
  if (affectedRows === 0) {
    throw new ServiceError("Something Went wrong", 401);
  }
  return affectedRows;
}
async function findLessonsByCourseId(courseId) {
  const lessons = await Coach.findAll({
    where: { gcId: courseId },
  });
  if (!lessons.length) {
    throw new ServiceError("Something Went wrong", 401);
  }

  lessons.forEach((lesson) => {
    if (!lesson?.image) return;
    const image = upload_file.getFileURL(lesson.image);
    lesson.image = image;
  });

  return lessons;
}
async function deleteLessonById(lessonId) {
  const deletedCoach = await Coach.destroy({
    where: { id: lessonId },
  });
  if (deletedCoach === 0) {
    throw new ServiceError("Something Went wrong", 401);
  }
  return deletedCoach;
}
module.exports = {
  createLesson,
  updateLesson,
  findLessonById,
  findLessonsByCourseId,
  deleteLessonById
};
