const URL = require("url").URL;

const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const models = require("../../models");
const ServiceError = require("../../utils/serviceError");

const Courses = models.Mobile_Course;

/**
 * @swagger
 * tags:
 *   name: GHIN
 *   description: GHIN App API's
 */
exports.update = async (req, res) => {
  /**
   * @swagger
   *
   * /ghin/{gcId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: Update GHIN URL for a course.
   *     tags: [GHIN]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - name: gcId
   *         description: id of golf course
   *         in: path
   *         required: true
   *         type: integer
   *
   *       - name: body
   *         description: GHIN URL for the Golf Course
   *         in: body
   *         schema:
   *            type: object
   *            required:
   *                - url
   *            properties:
   *                url:
   *                   type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   *       400:
   *         description: Request body is invalid
   *       404:
   *         description: Requested golf course doesn't exist in DB
   *       500:
   *         description: Something went wrong on server side
   */

  try {
    const bodyValidation = new Validator(req.body, {
      url: "required|string",
    });

    const paramsValidation = new Validator(req.params, {
      gcId: "required|integer",
    });

    if (bodyValidation.fails()) {
      throw new ServiceError(bodyValidation.errors.first("url"), 400);
    }

    if (paramsValidation.fails()) {
      throw new ServiceError(paramsValidation.errors.first("gcId"), 400);
    }

    const { url } = req.body;
    const { gcId } = req.params;

    const course = await Courses.findOne({
      attributs: ["id"],
      where: { id: gcId },
    });

    if (!course) {
      throw new ServiceError(`Course not found with id: ${gcId}`, 404);
    }

    try {
      new URL(url);
    } catch (err) {
      throw new ServiceError("Given url is invalid", 400);
    }

    await Courses.update({ ghin_url: url }, { where: { id: gcId } });

    return apiResponse.success(res, req, `URL: ${url} is set for ${gcId}`, 200);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
