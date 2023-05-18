const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");

// Logger Imports
const courseService = require("../../../services/kiosk/course");
const deviceService = require("../../../services/device");
const faqService = require("../../../services/kiosk/course-faqs");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.getFaqs = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/faqs:
   *   get:
   *     security:
   *       - auth: []
   *     description: list faqs for golf course.
   *     tags: [Kiosk-Courses-Content]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const deviceId = req.device.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    await courseService.getCourseById(courseId);

    const shops = await faqService.getCourseFaqByCourseId(courseId);
    return apiResponse.success(res, req, shops);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
