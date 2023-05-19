const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const deviceService = require("../../../services/device");
const membershipService = require("../../../services/kiosk/membership");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.getCourseMembership = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/memberships:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get course membership link.
   *     tags: [Kiosk-Courses-Content]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const deviceId = req.device.id; // device Id
    const courseId = await deviceService.getCourse(deviceId);
    const membership = await membershipService.getMembershipByCourseId(
      courseId,
    );
    return apiResponse.success(res, req, membership);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
