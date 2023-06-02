// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/mobile/game");
const holeService = require("../../services/mobile/hole");
const courseServices = require("../../services/mobile/courses");
const { validateObject } = require("../../common/helper");
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
   *     summary: create game
   *     description: logged In user can start/create game.
   *     tags: [Game]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: body
   *         name: body
   *         schema:
   *          type: object
   *          required:
   *           - gcId
   *           - teeColor
   *           - holes
   *          properties:
   *            gcId:
   *              type: integer
   *              example: 1
   *            teeColor:
   *              type: string
   *              example: Red
   *            holes:
   *              type: array
   *              items: object
   *              example: [{ holeId: 31931, holeNumber: 1, par: 4 }]
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

    const gameBody = validateObject(req.body, ["gcId", "teeColor"]);

    gameBody.ownerId = req.user.id;
    gameBody.participantId = req.user.id;
    gameBody.participantName = req.user.name;
    gameBody.startTime = new Date();
    gameBody.gameId = uuidv4();
    gameBody.orgId = req.user.orgId;

    const holes = req.body.holes;

    gameBody.totalIdealShots = holes.reduce(
      (accumulate, hole) => accumulate + hole.par,
      0,
    );

    const createdGame = await gameService.createGame(gameBody);
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

exports.getHoles = async (req, res) => {
  /**
   * @swagger
   *
   * /game/{gameId}/holes:
   *   get:
   *     security:
   *       - auth: []
   *     description: logged In user can fetch holes record by game Id.
   *     tags: [Game]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: gameId
   *         description: Id of the game
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const holes = await holeService.getGameHole(req.params.gameId);
    return apiResponse.success(res, req, holes);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
