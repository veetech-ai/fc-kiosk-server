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
 *   name: Statistics
 *   description: Games API's
 */
exports.getStatistics = async (req, res) => {
  /**
   * @swagger
   *
   * /users/:id:
   *   get:
   *     security:
   *       - auth: []
   *     summary: Statistics
   *     description: logged In user can get Statistics
   *     tags: [Statistics]
   *     consumes:
   *       - application/json
   *     parameters:
   *       - in: params
   *         name: userId
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

    const gameBody = validateObject(req.body, ["gcId", "teeColor"]);

    gameBody.ownerId = req.user.id;
    gameBody.participantId = req.user.id;
    gameBody.participantName = req.user.name;
    gameBody.startTime = new Date();
    gameBody.gameId = uuidv4();
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
