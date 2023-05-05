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
module.exports = {
  createCourse,
  getCoursesByOrganization,
};
