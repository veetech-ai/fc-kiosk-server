// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const screenService = require("../../../services/screenConfig/screens");
const deviceService = require("../../../services/device");
// Logger Imports

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.get_screens_for_device = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/screens:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get courses for a specific organization.
   *     tags: [Kiosk-Courses-Content]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const deviceId = req.user.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    const screens = await screenService.getScreensByCourses(courseId);
    return apiResponse.success(res, req, screens);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
