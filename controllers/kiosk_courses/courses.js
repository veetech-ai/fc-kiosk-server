// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
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
   *       - name: org_id
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
      org_id: "required|integer",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const { name, state, city, zip, phone, org_id } = req.body;
        const reqBody = {
          name,
          state,
          city,
          zip,
          phone,
        };
        const course = await courseService.createCourse(reqBody, org_id);
        return apiResponse.success(res, req, course);
      } catch (error) {
        const { code, message } = helper.getThrownErrorStatusAndMessage(error);
        return apiResponse.fail(res, message, code);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
exports.get_courses_for_organization = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/get/{orgId}:
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
   *         type: integer
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const validation = new Validator(req.params, {
      orgId: "required|integer",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const { orgId } = req.params;
        const course = await courseService.getCoursesByOrganization(orgId);
        return apiResponse.success(res, req, course);
      } catch (error) {
        const { code, message } = helper.getThrownErrorStatusAndMessage(error);
        return apiResponse.fail(res, message, code);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

