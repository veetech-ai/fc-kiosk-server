const apiResponse = require("../../common/api.response");
const clubServices = require("../../services/mobile/clubs");

/**
 * @swagger
 * tags:
 *   name: Clubs
 *   description: Clubs API's
 */

exports.get_clubs = async (req, res) => {
  /**
   * @swagger
   *
   * /clubs:
   *   get:
   *     security:
   *      - auth: []
   *     summary: Retrieves clubs for the logged in user.
   *     description: Retrieves clubs for a particular user who is logged in.
   *     tags: [Clubs]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const userId = req.user?.id;
    // Find all clubs for the user
    const clubs = await clubServices.getClubsByUserId(userId);

    return apiResponse.success(res, req, clubs);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
