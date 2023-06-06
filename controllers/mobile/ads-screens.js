const apiResponse = require("../../common/api.response");
const adsScreensService = require("../../services/mobile/ads-screens");

/**
 * @swagger
 * tags:
 *   name: Ads-Screens
 *   description: List of Screens in which ads will be shown
 */

exports.getScreens = async (req, res) => {
  /**
   * @swagger
   *
   * /adsScreens:
   *   get:
   *     security:
   *       - auth: []
   *     description: GET ads Screens.
   *     tags: [Ads-Screens]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;

    const ads = await adsScreensService.getAdsScreens({}, loggedInUserOrg);
    return apiResponse.success(res, req, ads);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
