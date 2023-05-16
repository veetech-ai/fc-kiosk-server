const apiResponse = require("../../common/api.response");
const Validator = require("validatorjs");
const CoursesServices = require("../../services/kiosk/course");
const CareersServices = require("../../services/kiosk/career");

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
   *         description: Gold course id, career to be attached with
   *         in: formData
   *         required: true
   *         type: string
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
   *         description: Career timings - string representation of the object e.g., '{"startTime": "10:00", "endTime": "16:00"}'
   *         in: formData
   *         required: true
   *         type: string
   *       - name: link
   *         description: Link to the third party career/job post e.g., indeed.com
   *         in: formData
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: success
   */
  const validation = new Validator(req.body, {
    title: "required|string",
    gcId: "required|integer",
    content: "required|string",
    type: "required|string",
    timings: "required|string",
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

    const career = await CareersServices.create(careerBody);
    return apiResponse.success(res, req, career);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
