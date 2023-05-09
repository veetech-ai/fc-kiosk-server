const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService=require("./membership");

const Course = models.Course;
const Organization = models.Organization;

async function createCourse(reqBody, orgId) {
  try {
    // Check if organization exists with the specified org_id
    const organization = await Organization.findOne({ where: { id: orgId } });
    if (!organization) {
      throw new ServiceError(`Organization not found`, 404);
    }

    // Create a new course record
    const course = await Course.create({
      ...reqBody,
      orgId,
    });

    // Create Screen Config to allow toggling visibility of content sections on kiosk
    const gcId = course.id;
    await screenConfigServices.createScreenConfig(gcId, orgId);
    await membershipService.createMembership(gcId, orgId);

    return course;
  } catch (error) {
    // Handle the error here
    throw new ServiceError('Failed to create course');
  }
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
