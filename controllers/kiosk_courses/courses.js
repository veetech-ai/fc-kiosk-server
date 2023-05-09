// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const upload_file = require("../../common/upload");
// Logger Imports
const courseService = require("../../services/kiosk/course");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses
 *   description: Courses API's
 */
exports.create_courses = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/create:
   *   post:
   *     security:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Kiosk-Courses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: name
   *         description: name of the golf course
   *         in: formData
   *         required: true
   *         type: string
   *       - name: state
   *         description: state in which golf course exist
   *         in: formData
   *         required: true
   *         type: string
   *       - name: city
   *         description: city in which golf course exist
   *         in: formData
   *         required: true
   *         type: string
   *       - name: zip
   *         description: zip
   *         in: formData
   *         required: false
   *         type: string
   *       - name: phone
   *         description: contact of golf course
   *         in: formData
   *         required: false
   *         type: string
   *       - name: orgId
   *         description: organization id to be linked to
   *         in: formData
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      name: "required|string",
      state: "required|string",
      city: "required|string",
      zip: "string",
      phone: "string",
      orgId: "required|integer",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const { name, state, city, zip, phone, orgId } = req.body;
    const reqBody = {
      name,
      state,
      city,
      zip,
      phone,
    };
    const course = await courseService.createCourse(reqBody, orgId);
    return apiResponse.success(res, req, course);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.get_courses_for_organization = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/{orgId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get courses for a specific organization.
   *     tags: [Kiosk-Courses]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: orgId
   *         description: Organization ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const orgId = Number(req.params.orgId);
    if (!orgId) {
      return apiResponse.fail(res, "orgId must be a valid number");
    }
    const courses = await courseService.getCoursesByOrganization(orgId);
    return apiResponse.success(res, req, courses);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.create_course_info = async (req, res) => {
  /**
   * @swagger
   * /kiosk-courses/{courseId}/course-info:
   *   patch:
   *     security:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Kiosk-Courses]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: path
   *         name: courseId
   *         description: id of course
   *         required: true
   *         type: integer
   *       - in: formData
   *         name: name
   *         description: name of course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: holes
   *         description: Holes of the golf course
   *         required: false
   *         type: integer
   *         enum: [9, 18]
   *       - in: formData
   *         name: par
   *         description: par of golf course
   *         required: false
   *         type: integer
   *       - in: formData
   *         name: length
   *         description: length of golf course in yards
   *         required: false
   *         type: string
   *       - in: formData
   *         name: slope
   *         description: slope of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: content
   *         description: description of golf course
   *         required: false
   *         type: string
   *       - name: logo
   *         description: Upload logo of Golf course 
   *         in: formData
   *         required: false
   *         type: file
   *       - in: formData
   *         name: course_images
   *         description: Images of the golf course
   *         required: false
   *         type: array
   *         items:
   *           type: file
   *         collectionFormat: multi
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    const form = new formidable.IncomingForm();
    form.multiples = true;
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const { name,holes, par, length, slope, content } = fields;
    const logoImages=files.logo;
    const courseImages = files.course_images;
    const logo=await upload_file.uploadLogoImage(logoImages, courseId, 3);
    const images = await upload_file.uploadCourseImage(courseImages, courseId, 3);
    const reqBody = {
      name,
      holes,
      par,
      length,
      slope,
      content,
      logo,
      images
    };
    const updatedCourse = await courseService.createCourseInfo(
      reqBody,
      courseId,
    );
    return apiResponse.success(res, req, updatedCourse);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
