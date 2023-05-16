const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");

// Logger Imports
const courseService = require("../../../services/kiosk/course");
const deviceService = require("../../../services/device");
const contactCoachService = require("../../../services/kiosk/contact_lesson");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.create_contact_lesson = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/lessons/contacts:
   *   post:
   *     security:
   *       - auth: []
   *     description: contact with lesson of golf course.
   *     tags: [Kiosk-Courses-Content]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: lessonId
   *         description: lessonId
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: phone
   *         description: phone of golfer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: email
   *         description: email of golfer
   *         in: formData
   *         required: false
   *         type: string
   *       - name: contact_medium
   *         description: contact_medium
   *         in: formData
   *         enum: ['phone', 'email']
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
      lessonId: "required|integer",
      phone: "string",
      email: "string",
      contact_medium: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const { lessonId, phone, email, contact_medium } = req.body;

    const deviceId = req.device.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    const course = await courseService.getCourseById(courseId);
    const orgId = course.orgId;
    const reqBody = {
      coachId: lessonId,
      userPhone: phone,
      userEmail: email,
      contactMedium: contact_medium,
      gcId: courseId,
      orgId,
    };
    const contactCoach = await contactCoachService.createContactCoach(reqBody);
    return apiResponse.success(res, req, contactCoach);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
