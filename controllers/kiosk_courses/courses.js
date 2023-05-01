// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");
const models = require("../../models/index");
const helper = require("../../common/helper");
const axios = require("axios");
const KioskCourseModel = models.Course;
const Organization = models.Organization;
// Logger Imports
const { logger } = require("../../logger");
const config = require("../../config/config");
const { Op, Sequelize } = require("sequelize");
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
   *     create:
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
   *         required: false
   *         type: string
   *       - name: city
   *         description: city in which golf course exist
   *         in: formData
   *         required: false
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
      state: "string",
      city: "string",
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
        const course = await courseService.createCourse(
          name,
          state,
          city,
          zip,
          phone,
          org_id,
        );
        return apiResponse.success(res, req, course);
      } catch (error) {
        console.log("from config", config.error_message_seperator);
        const statusCode = parseInt(
          error.message.split(`${config.error_message_seperator}`)[1],
        );
        const errorMessage = error.message.split(
          `${config.error_message_seperator}`,
        )[0];
        return apiResponse.fail(res, errorMessage || error, statusCode || 500);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
