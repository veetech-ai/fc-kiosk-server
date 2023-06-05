// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/mobile/game");
const holeService = require("../../services/mobile/hole");
const courseServices = require("../../services/mobile/courses");
const { validateObject } = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Games API's
 */
exports.create_game = async (req, res) => {
  /**
   * @swagger
   *
   * /games:
   *   post:
   *     security:
   *       - auth: []
   *     summary: create game
   *     description: logged In user can start/create game.
   *     tags: [Games]
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
   *           - gameId
   *          properties:
   *            gcId:
   *              type: integer
   *              example: 1
   *            gameId:
   *              type: string
   *              example: badbea4b-57f8-4402-8c5b-fbfd41d5a40c
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
      gameId: "required|string",
      holes: "required|array",
      "holes.*.par": "required|integer",
      "holes.*.holeId": "required|integer",
      "holes.*.holeNumber": "required|integer",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    // validate course Id is correct
    await courseServices.getCourseFromDb({
      id: req.body.gcId,
    });

    const gameBody = validateObject(req.body, ["gcId", "teeColor", "gameId"]);

    gameBody.ownerId = req.user.id;
    gameBody.participantId = req.user.id;
    gameBody.participantName = req.user.name;
    gameBody.startTime = new Date();
    gameBody.orgId = req.user.orgId;

    const holes = req.body.holes;

    gameBody.totalIdealShots = holes.reduce(
      (accumulate, hole) => accumulate + (hole.par || 0),
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
   * /games/{gameId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: logged In user can fetch holes record by game Id.
   *     tags: [Games]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: gameId
   *         description: Id of the game
   *         in: path
   *         required: true
   *         type: string
   *       - name: holeId
   *         description: Id of the game
   *         in: query
   *         required: false
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.query, {
      holeId: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const holeId = req.query?.holeId;

    const holes = await gameService.getGame(
      { gameId: req.params.gameId },
      holeId,
    );
    return apiResponse.success(res, req, holes);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
