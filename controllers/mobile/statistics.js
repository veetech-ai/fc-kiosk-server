// External Module Imports
const Validator = require("validatorjs");

const apiResponse = require("../../common/api.response");
const gameService = require("../../services/mobile/game");
const { Op, Sequelize } = require("sequelize");
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
   * /statistics:
   *   get:
   *     security:
   *       - auth: []
   *     summary: Statistics
   *     description: logged In user can get Statistics
   *     tags: [Statistics]
   *     consumes:
   *       - application/json
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  try {
    const loggedInUserId = req.user.id;

    const statistics = await gameService.findStatisticsByParticipantId(
      loggedInUserId,
    );

    const bestRounds = await gameService.findBestRoundsByParticipantId(
      loggedInUserId,
    );

    const totalStatistics = {
      statistics: statistics,
      bestRounds: bestRounds,
    };

    return apiResponse.success(res, req, totalStatistics);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
