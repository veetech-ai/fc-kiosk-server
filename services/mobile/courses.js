const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const CourseModel = models.Mobile_Course;

exports.getCourseFromDb = async (where) => {
  const courseFromDB = await CourseModel.findOne({ where });

  if (!courseFromDB) {
    throw new ServiceError("Course not found", 404);
  }

  const golfBertCourseId = courseFromDB.golfbertId;
  if (!golfBertCourseId) {
    throw new ServiceError(
      "Course's Golfbert id not found", 404
    );
  }
  return courseFromDB;
};
