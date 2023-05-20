const apiResponse = require("../../../common/api.response");
const CareersServices = require("../../../services/kiosk/career");
const DevicesServices = require("../../../services/device");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses-Content
 *   description: Careers (Jobs) Management
 */

exports.getAll = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-content/careers:
   *   get:
   *     security:
   *      - auth: []
   *     description: Get all careers
   *     tags: [Kiosk-Courses-Content]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const deviceId = req.device.id;

    const linkedCourse = await DevicesServices.getLinkedCourse(deviceId);

    const careers = await CareersServices.find({ gcId: linkedCourse.id });

    return apiResponse.success(res, req, careers);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
