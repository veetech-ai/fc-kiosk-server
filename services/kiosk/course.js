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
      `Invalid organization ID${config.error_message_separator}404`,
    );
  }

  // Create a new course record
  const course = await Course.create({
    ...reqBody,
    orgId,
  });
  return course;
}
module.exports = {
  createCourse,
};
