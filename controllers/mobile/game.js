// External Module Imports
const Validator = require("validatorjs");
const moment = require("moment");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/mobile/game");
const holeService = require("../../services/mobile/hole");
const courseServices = require("../../services/mobile/courses");
const helpers = require("../../common/helper");
const {
  invalidAllUnAcceptedInvitations,
  deletePlayerInvitationsForAParticularGame,
} = require("../../services/mobile/user-game-invitations");
const ServiceError = require("../../utils/serviceError");
const statisticService = require("../../services/mobile/statistics");
const { Op } = require("sequelize");

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

exports.endGame = async (req, res) => {
  /**
   * @swagger
   *
   * /games/{gameId}/end-game:
   *   patch:
   *     security:
   *       - auth: []
   *     summary: end game
   *     description: Owner of the game can end the game.
   *     tags: [Games]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: gameId
   *         description: ID of the game
   *         required: true
   *         type: string
   *       - in: body
   *         name: body
   *         schema:
   *          type: object
   *          required:
   *           - endTime
   *          properties:
   *            endTime:
   *              type: string
   *              example: 2019-05-22T10:30:00+03:00
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const validation = new Validator(req.body, {
      endTime: "required|string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const gameId = req.params.gameId;
    const endTime = req.body.endTime;

    if (!moment(endTime).isValid())
      return apiResponse.fail(res, "End time is invalid.", 400);

    const games = await gameService.getGames({
      gameId,
      endTime: { [Op.eq]: null },
    });

    if (!games.length || games[0].ownerId !== req.user.id)
      return apiResponse.fail(res, "Game not found", 400);

    const filteredGamesList = games.filter((game) => {
      return game.score !== null;
    });
    for await (const game of games) {
      const totalGir = game.Holes.filter((hole) => hole.isGir).length;
      const girPercentage = ((totalGir / game.Holes.length) * 100).toFixed(2);
      await gameService.updateGame(
        { gameId: gameId, participantId: game.participantId },
        {
          girPercentage,
          endTime: endTime,
          updatedAt: endTime,
        },
      );
    }

    await invalidAllUnAcceptedInvitations(gameId);

    const retain = false;
    helpers.mqtt_publish_message(
      `game/${gameId}/screens`,
      {
        action: "end-game",
      },
      retain,
    );
    for await (const game of filteredGamesList) {
      const existingStats = await statisticService.getStatistic(
        game.participantId,
      );

      if (existingStats) {
        const statistics =
          await gameService.calculateStatisticsBasedOnExistingRecord(
            existingStats.dataValues,
            gameId,
          );
        await statisticService.createStatistic(statistics);
        continue;
      }
      const statistics = await gameService.findStatisticsByParticipantId(
        game.participantId,
      );

      let reqBody = {
        userId: game.participantId,
        rounds: statistics.rounds,
        avgGirPercentage: statistics.avgGirPercentage,
        bestScore: statistics.bestScore,
        worstScore: statistics.worstScore,
        avg: statistics.avg,
      };
      if (!existingStats) {
        reqBody.bestScoreRelativeToPar = game.score;
        reqBody.worstScoreRelativeToPar = game.score;
      }
      await statisticService.createStatistic(reqBody);
    }

    return apiResponse.success(res, req, "Game ended successfully");
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

    const isGameBelongToUser = await gameService.getGames({
      gameId: req.params.gameId,
      participantId: req.user.id,
    });
    if (!isGameBelongToUser.length)
      return apiResponse.fail(res, "Invalid game id", 400);

    const holeId = req.query?.holeId;

    const holes = await gameService.getGames(
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

    const hole = await holeService.getHoleByWhere(filteredQueryParamsForHoles);
    filteredBodyForHoles.isGir =
      hole?.par - filteredBodyForHoles?.noOfShots >= 2;

    const noOfAffectedRows = await holeService.updateHoleByWhere(
      filteredQueryParamsForHoles,
      filteredBodyForHoles,
    );

    // calculate the total score for all the holes of the particular gameId for given userId
    const totalShotsTaken =
      await holeService.getUserTotalShotsTakenForGameHoles(
        participantId,
        gameId,
      );

    await gameService.updateGameIfGameIdIsValid(
      { gameId, participantId },
      { ...filteredBodyForGame, totalShotsTaken },
    );

    if (noOfAffectedRows) {
      const retain = false;
      helpers.mqtt_publish_message(
        `game/${filteredQueryParamsForHoles.gameId}/screens`,
        { action: "scorecard" },
        retain,
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
exports.updateTrackShots = async (req, res) => {
  /**
   * @swagger
   *
   * /games/holes/track-shot:
   *   patch:
   *     security:
   *       - auth: []
   *     description: logged In user can update trackshot record by game Id + user Id + hole number .
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
   *           - trackedShots
   *           - updatedAt
   *          properties:
   *            updatedAt:
   *              type: string
   *              example: 2030-05-22T10:30:00+03:00
   *            trackedShots:
   *              type: string
   *              example: '[{"latitude":"34.8697", "longitude":"111.7610"}]'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const bodyValidation = new Validator(req.body, {
      updatedAt: "required:string",
      trackedShots: "required:json",
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

    // Filter out the query params
    const filteredQueryParamsForHoles = helpers.validateObject(req.query, [
      "userId",
      "holeNumber",
      "gameId",
    ]);
    // Filter out the body for TrackedShots
    const filteredBodyForTrackedShots = helpers.validateObject(req.body, [
      "trackedShots",
      "updatedAt",
    ]);

    const noOfAffectedRows = await holeService.updateHoleTrackShotByWhere(
      filteredQueryParamsForHoles,
      filteredBodyForTrackedShots,
    );

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

exports.getHistory = async (req, res) => {
  /**
   * @swagger
   *
   * /games:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get games history of login user.
   *     tags: [Games]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    let userId = req.user.id;
    const gamesHistory = await gameService.getGamesHistoryByParticipantId(
      userId,
    );

    return apiResponse.success(res, req, gamesHistory);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.removePlayerFromAGame = async (req, res) => {
  /**
   * @swagger
   *
   *   /games/users:
   *     delete:
   *       security:
   *         - auth: []
   *       summary: Remove user from game and its respective holes
   *       description: Removes a participant from a game
   *       tags: [Games]
   *       produces:
   *         - application/json
   *       parameters:
   *         - name: participantId
   *           in: query
   *           description: ID of the user to remove from the game
   *           required: true
   *           type: integer
   *         - name: gameId
   *           in: query
   *           description: ID of the game from which to remove the user
   *           required: true
   *           type: string
   *       responses:
   *         200:
   *           description: Success
   */

  try {
    const validation = new Validator(req.query, {
      participantId: "required",
      gameId: "required",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    const participantId = req.query.participantId;
    const gameId = req.query.gameId;
    const loggedInUserId = req.user.id;
    const game = await gameService.isGameOwner(loggedInUserId, gameId);
    if (!game) {
      throw new ServiceError("Only game owner can remove the player", 403);
    }

    if (game.ownerId == participantId) {
      throw new ServiceError(
        "Game owner can not be removed from the game",
        403,
      );
    }

    const noOfAffectedRows = await gameService.removeUserFromAGame(
      participantId,
      gameId,
    );

    await deletePlayerInvitationsForAParticularGame(participantId, gameId);

    if (noOfAffectedRows) {
      helpers.mqtt_publish_message(
        `game/${game.gameId}/screens`,
        { action: "scorecard" },
        false,
      );
    }
    return apiResponse.success(
      res,
      req,
      "Player removed from the game successfully",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
