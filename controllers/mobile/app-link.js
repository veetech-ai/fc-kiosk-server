const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const config = require("../../config/config");

/**
 * @swagger
 * tags:
 *   name: App Link
 *   description: App Link API's
 */

exports.getMobileAppLink = async (req, res) => {
  /**
   * @swagger
   *
   * /app-link:
   *   get:
   *     summary: Retrieve app link.
   *     description: Retrieve app link based on OS the request is coming from (Android || iOS).
   *     tags: [App Link]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const os = helper.getRequestOriginOperatingSystem(req);
    let appLink = config.mobileApp.android;

    if (os === "iPhone") {
      appLink = config.mobileApp.iOS;
    }

    return res.redirect(appLink);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
