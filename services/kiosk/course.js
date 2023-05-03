const config = require("../../config/config");
const helper = require("../../common/helper");
const models = require("../../models/index");
const Course = models.Course;
const Organization = models.Organization;

async function createCourse(reqBody, orgId) {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new Error(
      `Organization not found${config.error_message_separator}404`,
    );
  }

  // Create a new course record
  const course = await Course.create({
    ...reqBody,
    orgId,
  });
  return course;
}
async function getCoursesByOrganization(orgId) {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new Error(`Organization not found${config.error_message_separator}404`);
  }
  // Find course record
  const courses = await Course.findAll({
    where: {
      orgId,
    },
  });
  if (courses.length === 0) {
    throw new Error(`No courses found for organization${config.error_message_separator}404`);
  }
  return courses;
}
module.exports = {
  createCourse,
  getCoursesByOrganization,
};
