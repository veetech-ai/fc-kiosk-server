// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/game/game");
const courseServices = require("../../services/mobile/courses");
const { v4: uuidv4 } = require("uuid");

/**
 * @swagger
 * tags:
 *   name: Game
 *   description: Courses API's
 */
exports.create_game = async (req, res) => {
  /**
   * @swagger
   *
   * /game/:
   *   post:
   *     security:
   *       - auth: []
   *     description: logged In user can start/create game.
   *     tags: [Game]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: mcId
   *         description: Course ID
   *         in: body
   *         required: true
   *         type: string
   *       - name: totalIdealShots
   *         description: Course ID
   *         in: body
   *         required: true
   *         type: string
   *       - name: teeColor
   *         description: Course ID
   *         in: body
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      mcId: "required|integer",
      totalIdealShots: "required|min:1|integer",
      teeColor: "required|string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    // validate course Id is correct
    await courseServices.getCourseFromDb({
      id: req.body.mcId,
    });

    req.body.ownerId = req.user.id;
    req.body.participantId = req.user.id;
    req.body.participantName = req.user.name;
    req.body.startTime = new Date();
    req.body.gameId = uuidv4();
    req.body.orgId = req.user.orgId;

    const createdGame = await gameService.createGame(req?.body)
    return apiResponse.success(res, req, createdGame);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
