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
 *
 * /kiosk-courses/{courseId}/course-info:
 *   patch:
 *     security:
 *       - auth: []
 *     description: create golf course (Only Admin).
 *     tags: [Kiosk-Courses]
 *     parameters:
 *       - name: courseId
 *         description: id of course
 *         in: path
 *         required: true
 *         type: integer
 *       - name: holes
 *         description: Holes of the golf course
 *         in: formData
 *         required: false
 *         type: string
 *         enum:
 *           - '9'
 *           - '18'
 *         default: '9'
 *       - name: par
 *         description: par of golf course
 *         in: formData
 *         required: false
 *         type: integer
 *       - name: length
 *         description: length of golf course in yards
 *         in: formData
 *         required: false
 *         type: string
 *       - name: slope
 *         description: slope of golf course
 *         in: formData
 *         required: false
 *         type: string
 *       - name: content
 *         description: description of golf course
 *         in: formData
 *         required: false
 *         type: string
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
    // const course=await courseService.getCourseById(courseId);
    const validation = new Validator(req.body, {
      holes: "integer",
      par: "integer",
      length: "string",
      slope: "string",
      content: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const { holes, par, length, slope, content} = req.body;
    
    // const form = new formidable.IncomingForm();
    // const files = await new Promise((resolve, reject) => {
    //   form.parse(req, (err, fields, files) => {
    //     if (err) reject(err);
    //     resolve(files);
    //   });
    // });
    // const profileImage = files.course_image;
    // console.log("profile image :",profileImage);
    // const key = await upload_file.uploadProfileImage(profileImage, course.id);
    

    const reqBody = {
      holes, par, length, slope, content
    };
    const updatedCourse = await courseService.createCourseInfo(reqBody, courseId);
    return apiResponse.success(res, req, updatedCourse);

  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};