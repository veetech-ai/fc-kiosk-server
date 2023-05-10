// External Module Imports
const Validator = require("validatorjs");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const DeviceUniqueOnboardingCode = require("../../services/kiosk/device_onboarding_code");
// Logger Imports

/**
 * @swagger
 * tags:
 *   name: Device-Onboarding-Codes
 *   description: Apis for device-onboarding-codes. Used to onboard kiosks
 */
exports.getDeviceOnboardingCode = async (req, res) => {
  /**
   * @swagger
   *
   * /device-onboarding-codes:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get device unique onboarding code for onboarding a new device.
   *     tags: [Device-Onboarding-Codes]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const code = await DeviceUniqueOnboardingCode.getValidDeviceOnboardingCode();
    return apiResponse.success(res, req, code);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.refreshDeviceOnboardingCode = async (req, res) => {
  /**
   * @swagger
   *
   * /device-onboarding-codes/refresh:
   *   get:
   *     security:
   *       - auth: []
   *     description: Refresh device unique onboarding code for onboarding a new device.
   *     tags: [Device-Onboarding-Codes]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const code = await DeviceUniqueOnboardingCode.refreshDeviceOnboardingCode();
    return apiResponse.success(res, req, code);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
