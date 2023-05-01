// External Module Imports
const Validator = require("validatorjs");
const convert = require("convert-units");
const geolib = require("geolib");

// Common Imports
const apiResponse = require("../../common/api.response");
const models = require("../../models/index");
const CourseModel = models.Mobile_Course;
const helper = require("../../common/helper");
const axios = require("axios");
// Logger Imports
const { logger } = require("../../logger");
const config = require("../../config/config");
const { Op, Sequelize } = require("sequelize");

exports.create_courses = async (req, res) => {
  /**
   * @swagger
   *
   * /courses/create:
   *   post:
   *     create:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Courses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: name
   *         description: name of the golf course
   *         in: formData
   *         required: false
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
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      name: "string",
      state: "string",
      city: "string",
      zip: "string",
      phone: "string",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const { name, state, city, zip, phone } = req.body;
      } catch (error) {
        return apiResponse.fail(res, error.message || error, 500);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
