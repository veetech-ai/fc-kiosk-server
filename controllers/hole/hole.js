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
 *   name: Hole
 *   description: Hole API's
 */
exports.getHoles = async (req, res) => {
  /**
   * @swagger
   *
   * /holes/{gameId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: logged In user can fetch holes record by game Id.
   *     tags: [Hole]
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
