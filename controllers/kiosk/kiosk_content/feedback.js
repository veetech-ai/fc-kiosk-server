const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");

// Logger Imports
const courseService = require("../../../services/kiosk/course");
const deviceService = require("../../../services/device");
const feedbackService = require("../../../services/kiosk/feedback");
const helper = require("../../../common/helper");

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
   * /kiosk-content/feedbacks:
   *   post:
   *     security:
   *       - auth: []
   *     description: create feedback for golf course.
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
   *       - name: contact_medium
   *         description: contact_medium
   *         in: formData
   *         enum: ['text', 'call']
   *         required: false
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
      rating: "required|integer",
      contact_medium: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const { phone, rating, contact_medium } = req.body;

    const deviceId = req.device.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    const course = await courseService.getCourseById(courseId);
    const orgId = course.orgId;
    const reqBody = {
      phone,
      rating,
      contact_medium,
      gcId: courseId,
      orgId,
    };
    const feedback = await feedbackService.createFeedback(reqBody);
    helper.mqtt_publish_message(
      `gc/${courseId}/screens`,
      helper.mqttPayloads.onFeedbackUpdate,
      false,
    );
    return apiResponse.success(res, req, feedback);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getAverageRating = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/feedbacks/average:
   *   get:
   *     security:
   *       - auth: []
   *     description: get avaerage rating of the golf course.
   *     tags: [Kiosk-Courses-Content]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const deviceId = req.device.id;

    const course = await deviceService.getLinkedCourse(deviceId);

    const courseFeedBackSummary = await feedbackService.getAverageRating({
      gcId: course.id,
    });

    return apiResponse.success(res, req, courseFeedBackSummary);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
