const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const Course = models.Course;
const Organization = models.Organization;

async function createCourse(reqBody, orgId) {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new ServiceError(`Organization not found`, 200);
  }

  // Create a new course record
  const course = await Course.create({
    ...reqBody,
    orgId,
  });

  // Create Screen Config to allow toggling visibility of content sections on kiosk
  const gcId = course.id;
  screenConfigServices.createScreenConfig(gcId, orgId);
  return course;
}
async function getCoursesByOrganization(orgId) {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new ServiceError(`Organization not found`, 404);
  }

  // Find course record
  const courses = await Course.findAll({
    where: {
      orgId,
    },
  });

  return courses;
}
async function createCourseInfo(reqBody, courseId) {
  // Check if organization exists with the specified org_id
  // Create a new course record
  console.log("request Body :", reqBody);
  const updatedCourse = await Course.update(
    {
      ...reqBody,
    },
    { where: { id: courseId } },
  );
  if (!updatedCourse[0])
    throw new ServiceError("There is a problem. Please try later.");
  return updatedCourse;
}
async function getCourseById(courseId) {
  // Check if organization exists with the specified org_id
  const course = await Course.findOne({ where: { id: courseId } });
  if (!course) {
    throw new ServiceError(`Course not found`, 404);
  }
  return course;
}
module.exports = {
  createCourse,
  getCoursesByOrganization,
  getCourseById,
  createCourseInfo,
};
