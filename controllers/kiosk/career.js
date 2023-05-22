const apiResponse = require("../../common/api.response");
const Validator = require("validatorjs");
const CoursesServices = require("../../services/kiosk/course");
const CareersServices = require("../../services/kiosk/career");
const ServiceError = require("../../utils/serviceError");

const { validateObject } = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Careers
 *   description: Careers (Jobs) Management
 */

exports.create = async (req, res) => {
  /**
   * @swagger
   *
   * /careers:
   *   post:
   *     security:
   *      - auth: []
   *     description: Create new career
   *     tags: [Careers]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: title
   *         description: Career title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: gcId
   *         description: Golf course id, career to be attached with
   *         in: formData
   *         required: true
   *         type: number
   *       - name: content
   *         description: Career's content - Html in textual form
   *         in: formData
   *         required: true
   *         type: string
   *       - name: type
   *         description: Career title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: timings
   *         description: Career timings - string representation of the object
   *         in: formData
   *         required: false
   *         type: string
   *       - name: link
   *         description: Link to the third party career/job post e.g., indeed.com
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  Validator.register(
    "json",
    function (value) {
      try {
        JSON.parse(value);
      } catch (e) {
        return false;
      }
      return true;
    },
    "The :attribute must be a JSON string.",
  );
  const validation = new Validator(req.body, {
    title: "required|string",
    gcId: "required|integer",
    content: "required|string",
    type: "required|string",
    timings: "json",
  });

  if (validation.fails()) return apiResponse.fail(res, validation.errors);

  try {
    const careerBody = req.body;
    const loggedInUserOrgId = req.user.orgId;
    const course = await CoursesServices.getCourse(
      { id: careerBody.gcId },
      loggedInUserOrgId,
    );
    careerBody.orgId = course.orgId;

    const career = await CareersServices.createCareer(careerBody);
    return apiResponse.success(res, req, career);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCareersByCourseId = async (req, res) => {
  /**
   * @swagger
   *
   * /careers/courses/{courseId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all careers
   *     tags: [Careers]
   *     parameters:
   *       - name: courseId
   *         description: Id of the golf course
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
    // Pagination would be added later.

    const loggedInUserOrgId = req.user.orgId;

    const gcId = Number(req.params.courseId);
    if (!gcId) throw new ServiceError("The courseId must be an integer.", 400);

    const careers = await CareersServices.findCareers(
      { gcId },
      loggedInUserOrgId,
    );

    return apiResponse.success(res, req, careers);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateCareerById = async (req, res) => {
  /**
   * @swagger
   *
   * /careers/{careerId}:
   *   patch:
   *     security:
   *      - auth: []
   *     description: Partial update the career
   *     tags: [Careers]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: careerId
   *         description: Career id
   *         in: path
   *         required: true
   *         type: integer
   *       - name: title
   *         description: Career title
   *         in: formData
   *         required: false
   *         type: string
   *       - name: content
   *         description: Career's content - Html in textual form
   *         in: formData
   *         required: false
   *         type: string
   *       - name: type
   *         description: Career type e.g., Part Time, Full Time etc
   *         in: formData
   *         required: false
   *         type: string
   *       - name: timings
   *         description: Career timings - string representation of the object
   *         in: formData
   *         required: false
   *         type: string
   *       - name: link
   *         description: Link to the third party career/job post e.g., indeed.com
   *         in: formData
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  Validator.register(
    "json",
    function (value) {
      try {
        JSON.parse(value);
      } catch (e) {
        return false;
      }
      return true;
    },
    "The :attribute must be a JSON string.",
  );
  const validation = new Validator(req.body, {
    title: "string",
    content: "string",
    type: "string",
    timings: "json",
    link: "string",
  });

  if (validation.fails()) return apiResponse.fail(res, validation.errors);

  try {
    const careerId = Number(req.params.careerId);
    if (!careerId) {
      throw new ServiceError("The careerId must be an integer.", 400);
    }

    const allowedFields = ["title", "content", "type", "timings", "link"];
    const filteredBody = validateObject(req.body, allowedFields);

    const loggedInUserOrgId = req.user.orgId;

    await CareersServices.findOneCareer({ id: careerId }, loggedInUserOrgId);

    const noOfRowsUpdated = await CareersServices.updateCareerById(
      careerId,
      filteredBody,
    );
    return apiResponse.success(
      res,
      req,
      noOfRowsUpdated
        ? "Career updated successfully"
        : "Career already up to date",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCareerById = async (req, res) => {
  /**
   * @swagger
   *
   * /careers/{careerId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get career by id
   *     tags: [Careers]
   *     parameters:
   *       - name: careerId
   *         description: Id of the career
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
    const loggedInUserOrgId = req.user.orgId;

    const careerId = Number(req.params.careerId);
    if (!careerId)
      throw new ServiceError("The careerId must be an integer.", 400);

    const career = await CareersServices.findOneCareer(
      { id: careerId },
      loggedInUserOrgId,
    );

    return apiResponse.success(res, req, career);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteCareerById = async (req, res) => {
  /**
   * @swagger
   *
   * /careers/{careerId}:
   *   get:
   *     security:
   *      - auth: []
   *     description: Delete career by id
   *     tags: [Careers]
   *     parameters:
   *       - name: careerId
   *         description: Id of the career
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
    const loggedInUserOrgId = req.user.orgId;

    const careerId = Number(req.params.careerId);
    if (!careerId)
      throw new ServiceError("The careerId must be an integer.", 400);

    await CareersServices.deleteCareersWhere(
      { id: careerId },
      loggedInUserOrgId,
    );
    return apiResponse.success(res, req, "Career deleted successfully");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
