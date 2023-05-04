const config = require("../../config/config");
const helper = require("../../common/helper");
const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Course = models.Course;
const ScreenConfig = models.Screen_Config;
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
  const gcId = course.id;
  const screenConfig = await ScreenConfig.create({
    gcId,
    orgId,
  });
  return course;
}
async function getCoursesByOrganization(orgId) {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new ServiceError(`Organization not found`, 200);
  }
  // Find course record
  const courses = await Course.findAll({
    where: {
      orgId,
    },
  });
  if (courses.length === 0) {
    throw new ServiceError(`No courses found for organization`, 200);
  }
  return courses;
}
module.exports = {
  createCourse,
  getCoursesByOrganization,
};
