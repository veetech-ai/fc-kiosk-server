const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");

const Course = models.Course;
const Organization = models.Organization;

async function createCourse(reqBody, orgId) {
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
  const updatedCourse = await Course.update(
    {
      ...reqBody,
    },
    { where: { id: courseId } },
  );
  return updatedCourse;
}

async function getOne(where) {
  return await Course.findOne({ where });
}

async function getCourseById(courseId) {
  const course = await Course.findOne({
    where: {
      id: courseId,
    },
    attributes: {
      exclude: ["org_id"],
    },
  });

  if (!course) {
    throw new ServiceError("Course not found", 404);
  }
  return course;
}

async function getCourseById(courseId, orgId = null) {
  const where = {
    id: courseId,
  }
  
  if(orgId) where.orgId = orgId;

  const course = await Course.findOne({
    where,
    attributes: {
      exclude: ["org_id"],
    },
  });

  if (!course) {
    throw new ServiceError("Course not found", 404);
  }
  return course;
}

module.exports = {
  createCourse,
  getCoursesByOrganization,
  createCourseInfo,
  getOne,
  getCourseById,
};
