// External Module Imports
const Validator = require("validatorjs");

// Services Imports
const DeviceModel = require("../../services/device");
const GroupsModel = require("../../services/user_device_groups");
const ScheduleModel = require("../../services/schedule");
const GroupItemsModel = require("../../services/user_device_groups_items");
const FirmwareModel = require("../../services/firmware");
const GroupHistoryModel = require("../../services/group_history");
const organizationService = require("../../services/organization");
const golfbertService = require("../../services/golfbert/golfbert");

// Common Imports
const apiResponse = require("../../common/api.response");
const { getFileURL } = require("../../common/upload");
const helper = require("../../common/helper");
const axios = require("axios");
// Logger Imports
const { logger } = require("../../logger");

/**
 * @swagger
 * tags:
 *   name: Golfbert
 *   description: Golfbert API's
 */

exports.get_courses = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/courses:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a paginated list of courses. The request can be further parameterized to filter courses by name, city, state, zipcode, or gps coordinates.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: limit
   *         description: maximum number of results to return
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: marker
   *         description: marker of where to start returning results (in this case course id)
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: name
   *         description: return only courses that match this name e.g. Torrey Pines
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: city
   *         description: return only courses within given city e.g. Chicago
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: state
   *         description: return only courses within given state e.g. Alabama
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: zipcode
   *         description: return only courses within given zip code e.g. 99205
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: lat
   *         description: return only courses within given latitude and longitude. The params lat and long must be specified together otherwise the api will fail
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: long
   *         description: return only courses within given latitude and longitude. The params lat and long must be specified together otherwise the api will fail
   *         in: query
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const queryParams = {
      limit: req.query.limit,
      marker: req.query.marker,
      courseId: req.query.marker,
      name: req.query.name,
      city: req.query.city,
      state: req.query.state,
      zipcode: req.query.zipcode,
      lat: req.query.lat,
      long: req.query.long,
    };

    const response = await golfbertService.get_courses(queryParams);

    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_courses_by_courseId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/courses/{courseId}:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a course's details. This call expands on the information returned by the course listings call.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: courseId
   *         description: the id of the course whose information to be returned
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const courseId = req.params.courseId;

    const queryParams = {};
    const response = await golfbertService.get_course_by_id(
      courseId,
      queryParams,
    );

    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_holes_by_courseId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/courses/{courseId}/holes:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a course's holes' information.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: courseId
   *         description: the course id whose holes info to return
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const courseId = req.params.courseId;

    const queryParams = {};

    const response = await golfbertService.get_holes_by_courseId(
      courseId,
      queryParams,
    );

    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_scorecard_by_courseId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/courses/{courseId}/scorecard:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a course's scorecard.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: courseId
   *         description: the course id whose scorecard to return
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const courseId = req.params.courseId;

    const queryParams = {};

    const response = await golfbertService.get_scorecard_by_courseId(
      courseId,
      queryParams,
    );

    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_teeboxes_by_courseId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/courses/{courseId}/teeboxes:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a course's teeboxes.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: courseId
   *         description: the course id whose teeboxes to return
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const courseId = req.params.courseId;

    const queryParams = {};
    const response = await golfbertService.get_teeboxes_by_courseId(
      courseId,
      queryParams,
    );
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_holes = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/holes:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a paginated list of holes.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: courseId
   *         description: the course whose holes to return
   *         in: query
   *         required: true
   *         type: string
   *
   *       - name: limit
   *         description: maximum number of results to return
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: marker
   *         description: marker of where to start returning results (in this case hole number)
   *         in: query
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    if (!req.query.courseId) {
      return apiResponse.fail(res, "CourseId not found in query", 404);
    }

    const queryParams = {
      courseId: req.query.courseId,
      marker: req.query.marker,
      limit: req.query.limit,
    };

    const response = await golfbertService.get_holes(queryParams);

    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_holes_by_holeId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/holes/{holeId}:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a hole's details including geo information
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: holeId
   *         description: the hole id
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const holeId = req.params.holeId;
    const queryParams = {};
    if (!holeId) {
      return apiResponse.fail(res, "Hole Id not found in params", 404);
    }
    const response = await golfbertService.get_holes_by_holeId(
      holeId,
      queryParams,
    );

    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_polygons_by_holeId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/holes/{holeId}/polygons:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a holes's polygons. This information can be used to render the hole accurately on top of a map.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: holeId
   *         description: the hole id
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const holeId = req.params.holeId;
    const queryParams = {};
    if (!holeId) {
      return apiResponse.fail(res, "Hole Id not found in params", 404);
    }

    const response = await golfbertService.get_polygons_by_holeId(
      holeId,
      queryParams,
    );
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_teeboxes_by_holeId = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/holes/{holeId}/teeboxes:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves a holes's teeboxes.
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: holeId
   *         description: the hole id
   *         in: path
   *         required: true
   *         type: string
   *
   *       - name: color
   *         description: teebox color to filter by
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: teeboxtype
   *         description: teebox color to filter by
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: par
   *         description: only show holes with a specific par
   *         in: query
   *         required: false
   *         type: string
   *
   *       - name: handicap
   *         description: only show holes with a specific handicap
   *         in: query
   *         required: false
   *         type: string
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const holeId = req.params.holeId;
    if (!holeId) {
      return apiResponse.fail(res, "Hole Id not found in params", 404);
    }

    const queryParams = {
      color: req.query.color,
      teeboxtype: req.query.teeboxtype,
      par: req.query.par,
      handicap: req.query.handicap,
    };

    const response = await golfbertService.get_teeboxes_by_holeId(
      holeId,
      queryParams,
    );
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_teeboxcolors = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/teeboxcolors:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves all available teebox colors
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const queryParams = {};

    const response = await golfbertService.get_teeboxcolors(queryParams);
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};

exports.get_teeboxtypes = async (req, res) => {
  /**
   * @swagger
   *
   * /golfbert/teeboxtypes:
   *   get:
   *     search:
   *       - auth: []
   *     description: Retrieves all available teebox types. This serves as an enum of all available teebox types
   *     tags: [Golfbert]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const queryParams = {};

    const response = await golfbertService.get_teeboxtypes(queryParams);
    return apiResponse.success(res, req, response);
  } catch (error) {
    return apiResponse.fail(res, error, 500);
  }
};
