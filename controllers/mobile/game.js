// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/mobile/game");
const holeService = require("../../services/mobile/hole");
const courseServices = require("../../services/mobile/courses");
const helpers = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Games
 *   description: Games API's
 *
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
   *            startTime:
   *              type: string
   *              example: 2019-05-22T10:30:00+03:00
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
      startTime: "required|string",
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

    const gameBody = helpers.validateObject(req.body, [
      "gcId",
      "teeColor",
      "gameId",
      "startTime",
    ]);

    // validate game Id
    const isGameExistWithGameId = await gameService.getOneGame({
      gameId: gameBody.gameId,
    });
    if (isGameExistWithGameId)
      return apiResponse.fail(res, "Invalid game id", 400);

    gameBody.ownerId = req.user.id;
    gameBody.participantId = req.user.id;
    gameBody.participantName = req.user.name;
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
      createdGame.gameId,
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

    const isGameBelongToUser = await gameService.getGame({
      gameId: req.params.gameId,
      participantId: req.user.id,
    });
    if (!isGameBelongToUser.length)
      return apiResponse.fail(res, "Invalid game id", 400);

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

exports.updateHoles = async (req, res) => {
  /**
   * @swagger
   *
   * /games/holes:
   *   patch:
   *     security:
   *       - auth: []
   *     description: logged In user can update holes record by game Id + user Id + hole number .
   *     tags: [Games]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - name: gameId
   *         description: Id of the game
   *         in: query
   *         required: true
   *         type: string
   *       - name: userId
   *         description: Id of the user
   *         in: query
   *         required: true
   *         type: integer
   *       - name: holeNumber
   *         description: hole number
   *         in: query
   *         required: true
   *         type: integer
   *       - in: body
   *         name: body
   *         schema:
   *          type: object
   *          required:
   *           - noOfShots
   *           - updatedAt
   *           - score
   *          properties:
   *            noOfShots:
   *              type: integer
   *              example: 1
   *            updatedAt:
   *              type: string
   *              example: 2019-05-22T10:30:00+03:00
   *            score:
   *              type: integer
   *              description: It is the difference of no of shots and par (noOfShots - par).
   *              example: -3
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const bodyValidation = new Validator(req.body, {
      noOfShots: "required|integer",
      updatedAt: "required|string",
      score: "required|integer",
    });

    const queryValidation = new Validator(req.query, {
      userId: "required:integer",
      holeNumber: "required:integer",
      gameId: "required:string",
    });

    if (bodyValidation.fails())
      return apiResponse.fail(res, bodyValidation.errors);
    if (queryValidation.fails())
      return apiResponse.fail(res, queryValidation.errors);

    // Filter out the body
    const filteredBodyForHoles = helpers.validateObject(req.body, [
      "noOfShots",
      "trackedShots",
      "updatedAt",
    ]);

    const filteredBodyForGame = helpers.validateObject(req.body, [
      "score",
      "updatedAt",
    ]);

    // Filter out the query params
    const filteredQueryParamsForHoles = helpers.validateObject(req.query, [
      "userId",
      "holeNumber",
      "gameId",
    ]);

    const { gameId, userId: participantId } = helpers.validateObject(
      req.query,
      ["userId", "gameId"],
    );

    await gameService.updateGameIfGameIdIsValid(
      { gameId, participantId },
      filteredBodyForGame,
    );

    const hole = await holeService.getHoleByWhere(filteredQueryParamsForHoles);
    filteredBodyForHoles.isGir =
      hole?.par - filteredBodyForHoles?.noOfShots >= 2;

    const noOfAffectedRows = await holeService.updateHoleByWhere(
      filteredQueryParamsForHoles,
      filteredBodyForHoles,
    );

    if (noOfAffectedRows) {
      helpers.mqtt_publish_message(
        `game/${filteredQueryParamsForHoles.gameId}/screens`,
        { action: "scorecard" },
      );
    }
    return apiResponse.success(
      res,
      req,
      noOfAffectedRows
        ? "Scorecard updated successfully"
        : "Scorecard already up to date",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
