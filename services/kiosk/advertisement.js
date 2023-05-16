const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");
const organizationService = require("../organization");

const Course = models.Course;
const Organization = models.Organization;
const AdModel = models.Ad;

async function createAdvertisement(reqBody, gcId) {
  const ad = await AdModel.create({
    ...reqBody,
    gcId,
  });

  return ad;
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
  if (!updatedCourse[0])
    throw new ServiceError("There is a problem. Please try later.");
  return updatedCourse;
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

module.exports = {
  createAdvertisement,
  getCoursesByOrganization,
  createCourseInfo,
  getCourseById,
};
