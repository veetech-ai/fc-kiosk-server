// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/game/game");
const holeService = require("../../services/game/hole");
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
   * /game:
   *   post:
   *     security:
   *       - auth: []
   *     description: logged In user can start/create game.
   *     tags: [Game]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: gcId
   *         description: Course ID
   *         in: body
   *         required: true
   *         type: string
   *       - name: totalIdealShots
   *         description: Total Ideal Shots
   *         in: body
   *         required: true
   *         type: string
   *       - name: teeColor
   *         description: Color of the tee
   *         in: body
   *         required: true
   *         type: string
   *       - name: holes
   *         example: [{ holeId: 1, holeNumber: 1, par: 5 }]
   *         description: array of holes. The hole object properties are should be same as in the example
   *         in: body
   *         required: true
   *         type: array
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      gcId: "required|integer",
      teeColor: "required|string",
      holes: "required|array",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    // validate course Id is correct
    await courseServices.getCourseFromDb({
      id: req.body.gcId,
    });

    req.body.ownerId = req.user.id;
    req.body.participantId = req.user.id;
    req.body.participantName = req.user.name;
    req.body.startTime = new Date();
    req.body.gameId = uuidv4();
    req.body.orgId = req.user.orgId;
    const holes = req.body.holes;
    delete req.body.holes;

    req.body.totalIdealShots = holes.reduce(
      (accumulate, hole) => accumulate + hole.par,
      0,
    );

    const createdGame = await gameService.createGame(req?.body);
    await holeService.createGameHoles(
      holes,
      req.user.id,
      createdGame.id,
      req.body.gcId,
    );
    return apiResponse.success(res, req, createdGame);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
