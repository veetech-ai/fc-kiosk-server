// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../../common/api.response");
const helper = require("../../../common/helper");
const upload_file = require("../../../common/upload");
// Logger Imports
const courseService = require("../../../services/kiosk/course");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Memberships
 *   description: Courses API's
 */
exports.createMembership = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/membership:
   *   post:
   *     security:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Kiosk-Memberships]
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
exports.getMemberships = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/memberships/{gcId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get membership for a specific golf course.
   *     tags: [Kiosk-Memberships]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: gcId
   *         description: Golf Course ID
   *         in: path
   *         required: true
   *         type: integer
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const gcId = Number(req.params.gcId);
    if (!gcId) {
      return apiResponse.fail(res, "gcId must be a valid number");
    }
    const courses = await courseService.getCoursesByOrganization(gcId);
    return apiResponse.success(res, req, courses);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
}