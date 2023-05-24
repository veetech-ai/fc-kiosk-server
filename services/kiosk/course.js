const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");
const upload_file = require("../../common/upload");

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

  // Attach Images URLs
  if (courses.length) {
    courses.forEach((course) => {
      if (course.logo) {
        const logo = upload_file.getFileURL(course.logo);
        course.setDataValue("logo", logo);
      }

      if (course.images && course.images.length) {
        const images = upload_file.getFileURL(course.images);
        course.setDataValue("images", images);
      }
    });
  }

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
async function getLinkedCourse(courseId, orgId) {
  const course = await Course.findOne({
    where: {
      id: courseId,
      orgId,
    },
    attributes: {
      exclude: ["org_id"],
    },
  });
  if (!course) {
    throw new ServiceError("Not found", 404);
  }
  return course;
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
      exclude: ["org_id", "gc_id"],
    },
  });

  if (!course) {
    throw new ServiceError("Course not found", 404);
  }
  return course;
}

async function getCourse(where, loggedInUserOrgId) {
  if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;

  const course = await Course.findOne({
    where,
  });

  if (!course) {
    throw new ServiceError("Course not found", 404);
  }
  return course;
}

async function getCourseImages(courseId) {
  const course = await Course.findByPk(courseId, {
    attributes: ["images"], // only fetch the 'images' column
  });

  if (!course) {
    throw new Error("Course not found");
  }

  return course.images;
}

async function deleteWhere(where) {
  return await Course.destroy({ where });
}


module.exports = {
  createCourse,
  getCoursesByOrganization,
  createCourseInfo,
  getLinkedCourse,
  getOne,
  getCourseById,
  getCourse,
  getCourseImages,
  deleteWhere,
};
