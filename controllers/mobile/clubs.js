// External Module Imports
const Validator = require("validatorjs");
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

exports.updateClubs = async (req, res) => {
  /**
   * @swagger
   *
   * /clubs:
   *   put:
   *     security:
   *       - auth: []
   *     description: Update clubs data for a particular user who is logged in.
   *     tags: [Clubs]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: body
   *         in: body
   *         required: true
   *         schema:
   *           type: object
   *           properties:
   *             driver:
   *               type: integer
   *             wood3:
   *               type: integer
   *             wood5:
   *               type: integer
   *             iron4:
   *               type: integer
   *             iron5:
   *               type: integer
   *             iron6:
   *               type: integer
   *             iron7:
   *               type: integer
   *             iron8:
   *               type: integer
   *             iron9:
   *               type: integer
   *             pitchingWedge:
   *               type: integer
   *             wedge52:
   *               type: integer
   *             wedge56:
   *               type: integer
   *             wedge60:
   *               type: integer
   *             putter:
   *               type: integer
   *             gapWedge:
   *               type: integer
   *             sandWedge:
   *               type: integer
   *             lobWedge:
   *               type: integer
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      driver: "integer",
      wood3: "integer",
      wood5: "integer",
      iron4: "integer",
      iron5: "integer",
      iron6: "integer",
      iron7: "integer",
      iron8: "integer",
      iron9: "integer",
      pitchingWedge: "integer",
      wedge52: "integer",
      wedge56: "integer",
      wedge60: "integer",
      putter: "integer",
      gapWedge: "integer",
      sandWedge: "integer",
      lobWedge: "integer",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const updates = req.body; // Assuming the request body contains the updated club data

    // Update the clubs data for the user
    const loggedInUserId = req.user.id;
    await clubServices.updateClubs(loggedInUserId, updates);

    const updatedClubs = await clubServices.getClubsByUserId(loggedInUserId);

    return apiResponse.success(res, req, updatedClubs);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
