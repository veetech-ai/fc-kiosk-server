// External Module Imports
const Validator = require("validatorjs");
const convert = require("convert-units");
const geolib = require("geolib");

// Common Imports
const apiResponse = require("../../common/api.response");
const models = require("../../models/index");
const helper = require("../../common/helper");
const axios = require("axios");
// Logger Imports
const { logger } = require("../../logger");
const config = require("../../config/config");
const { Op, Sequelize } = require("sequelize");
const golfbertService = require("../../services/golfbert/golfbert");
const courseServices = require("../../services/mobile/courses");
const CourseModel = models.Mobile_Course;

/**
 * @swagger
 * tags:
 *   name: Courses
 *   description: Courses API's
 */

exports.get_courses = async (req, res) => {
  /**
   * @swagger
   *
   * /courses:
   *   get:
   *     security: []
   *     description: Retrieves a paginated list of courses. The request can be further parameterized to filter courses by name, city, state, zipcode, or gps coordinates.
   *     tags: [Courses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: name
   *         description: name of the golf course
   *         in: query
   *         required: false
   *         type: numeric
   *       - name: range
   *         description: distance range to find courses in
   *         in: query
   *         required: false
   *         type: integer
   *       - name: unit
   *         description: range unit
   *         in: query
   *         required: false
   *         type: string
   *         enum:
   *           - miles
   *           - kilometers
   *       - name: limit
   *         description: maximum number of results to return
   *         in: query
   *         required: false
   *         type: numeric
   *       - name: page
   *         description: page to return the records for
   *         in: query
   *         required: false
   *         type: numeric
   *       - name: lat
   *         description: return only courses within given latitude and longitude. The params lat and long must be specified together otherwise the api will fail
   *         in: query
   *         required: false
   *         type: numeric
   *       - name: long
   *         description: return only courses within given latitude and longitude. The params lat and long must be specified together otherwise the api will fail
   *         in: query
   *         required: false
   *         type: numeric
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      name: "string",
      range: "integer",
      unit: "string",
      limit: "integer",
      page: "integer",
      lat: "required|numeric",
      long: "required|numeric",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        console.time("TIme");
        const queryParams = {
          name: req.query.name,
          unit: req.query.unit || "miles",
          range: parseInt(req.query.range || 50),
          lat: Number(req.query.lat),
          long: Number(req.query.long),
          page: parseInt(req.query.page || 1),
          limit: parseInt(req.query.limit || config.tableRecordsLimit),
        };

        const unitAbbreviation = queryParams.unit === "miles" ? "mi" : "km";

        const distanceInMeters = convert(queryParams.range)
          .from(unitAbbreviation)
          .to("m");

        const boundingBox = geolib.getBoundsOfDistance(
          { latitude: queryParams.lat, longitude: queryParams.long },
          distanceInMeters,
        );

        const latRange = {
          min: boundingBox[0].latitude,
          max: boundingBox[1].latitude,
        };
        const longRange = {
          min: boundingBox[0].longitude,
          max: boundingBox[1].longitude,
        };

        let query = {
          where: {},
          limit: queryParams.limit,
          offset: helper.get_pagination_params(req.query).offset,
          attributes: [
            "id",
            "name",
            "phone",
            "country",
            "street",
            "city",
            "state",
            "zip",
            "lat",
            "long",
            "createdAt",
            "updatedAt",
          ],
          raw: true,
        };

        // if does not have name then regard for the range and unit otherwise find all records
        if (!queryParams.name) {
          query.where = {
            lat: { [Op.between]: [latRange.min, latRange.max] },
            long: { [Op.between]: [longRange.min, longRange.max] },
          };
        } else {
          query.where = Sequelize.where(
            Sequelize.fn("LOWER", Sequelize.col("name")),
            "LIKE",
            `%${queryParams.name.toLowerCase()}%`,
          );
        }

        const golfCourses = await CourseModel.findAll(query);

        const coursesRoughlyInRange = golfCourses
          .filter((course) => course?.lat && course?.long)
          .map((course) => {
            const distanceToCourseInMeters = geolib.getDistance(
              { latitude: queryParams.lat, longitude: queryParams.long },
              { latitude: course.lat, longitude: course.long },
            );
            const distanceInUnits = convert(distanceToCourseInMeters)
              .from("m")
              .to(unitAbbreviation);
            const courseWithDistance = Object.assign({}, course, {
              distance: Number(distanceInUnits.toFixed(1)),
              unit: queryParams.unit,
            });

            return courseWithDistance;
          })
          .sort((a, b) => a.distance - b.distance);

        console.log(coursesRoughlyInRange.length);
        console.timeEnd("TIme");

        return apiResponse.success(res, req, coursesRoughlyInRange);
      } catch (error) {
        return apiResponse.fail(res, error.message || error, 500);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.getCourse = async (req, res) => {
  /**
   * @swagger
   *
   * /courses/{courseId}:
   *   get:
   *     security: []
   *     description: Retrieves the hole related information for a single course
   *     tags: [Courses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: courseId
   *         description: Id of the course
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {});

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      try {
        const courseId = Number(req.params.courseId);
        const courseFromDB = await courseServices.getCourseFromDb({ id: courseId })

        const golfBertCourseId = courseFromDB.golfbertId;
        const holesInfo = await golfbertService.get_holes_by_courseId(
          golfBertCourseId,
        );

        const parInfo = await golfbertService.get_scorecard_by_courseId(
          golfBertCourseId,
        );

        const response = { pars: parInfo, holes: holesInfo };
        return apiResponse.success(res, req, response);
      } catch (error) {
        const { code, message } = helper.getThrownErrorStatusAndMessage(error)
        return apiResponse.fail(res, message, code);
      }
    });
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
