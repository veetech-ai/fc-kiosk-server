const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const helper = require("../../../common/helper");
// Logger Imports
const courseService = require("../../../services/kiosk/course");
const deviceService = require("../../../services/device");
const feedbackService=require("../../../services/kiosk/feedback")

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.create_feedback = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/feedback:
   *   post:
   *     security:
   *       - auth: []
   *     description: create feedback for golf course (Only Admin).
   *     tags: [Kiosk-Courses-Content]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: phone
   *         description: phone of reviewer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: rating
   *         description: rating of golf course
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: contatc_medium
   *         description: contact_medium
   *         in: formData
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      phone: "string",
      rating: "required||number",
      contact_medium:"string"
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const {phone,rating,contact_medium } = req.body;

    const deviceId = req.user.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    const course=await courseService.getCourseById(courseId)
    const orgId=course.orgId
    const reqBody = {
      phone,rating,contact_medium,gc_id:courseId,orgId
  };

    const feedback = await feedbackService.createFeedback(reqBody);
    return apiResponse.success(res, req, feedback);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};