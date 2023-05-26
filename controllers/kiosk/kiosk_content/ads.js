const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const upload_file = require("../../../common/upload");
const DevicesServices = require("../../../services/device");
const adsService = require("../../../services/kiosk/ads");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Courses API's for Device
 */
exports.getAds = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/ads:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get ads for linked course.
   *     tags: [Kiosk-Courses-Content]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const deviceId = req.device.id;
    const linkedCourse = await DevicesServices.getLinkedCourse(deviceId);
    const ads = await adsService.getAds({ gcId: linkedCourse.id });

    return apiResponse.success(res, req, ads);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
