const { Op } = require("sequelize");

const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const { mobileGame } = require("../../config/config");
const Game = models.Game;
const {Sequelize } = require("sequelize");
async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
  });

  return game;
}

async function findStatisticsByParticipantId(participantId) {
  const rounds = await Game.count({
    where: {
      participantId,
      endTime: { [Op.ne]: null },
    },
  });

  if (!rounds)
    return { rounds: rounds, bestScore: null, worstScore: null, avg: null };

  const scores = await Game.findAll({
    where: {
      participantId,
      endTime: { [Op.ne]: null },
    },
    order: [["score", "ASC"]],
  });

  const totalShotsTaken = await Game.findOne({
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col("totalShotsTaken")), "sum"],
    ],
    where: {
      participantId,
      endTime: { [Op.ne]: null },
    },
    raw: true,
  });

  return {
    rounds,
    worstScore: scores[scores.length - 1].totalShotsTaken,
    bestScore: scores[0].totalShotsTaken,
    avg: totalShotsTaken.sum / rounds,
  };
}

async function findBestRoundsByParticipantId(participantId, limit) {
  const bestRounds = await Game.findAll({
    attributes: [
      "totalShotsTaken",
      "totalIdealShots",
      "startTime",
      "endTime",
      "score",
    ],
    include: [
      {
        as: "Golf_Course",
        model: models.Mobile_Course,
        attributes: ["name"],
      },
    ],

    where: {
      participantId,
      endTime: { [Op.ne]: null },
    },
    order: [[Sequelize.literal("score"), "DESC"]],
    limit: limit,
  });

  return bestRounds;
}

async function isGameOwner(userId, gameId) {
  const game = await Game.findOne({
    where: {
      ownerId: userId,
      gameId,
    },
    include: [
      {
        as: "Golf_Course",
        model: models.Mobile_Course,
        attributes: ["name"],
      },
    ],
  });

  return game;
}

async function getGames(where, holeId = null) {
  let holeWhere = {};
  if (holeId) holeWhere = { id: holeId };
  return await Game.findAll({
    where,
    attributes: [
      "id",
      "participantId",
      "ownerId",
      "participantName",
      "score",
      "teeColor",
      "startTime",
      "endTime",
      "updatedAt",
    ],
    include: [
      {
        as: "Holes",
        model: models.Hole,
        attributes: [
          "id",
          "par",
          "noOfShots",
          "isGir",
          "trackedShots",
          "holeNumber",
          "updatedAt",
        ],
        where: holeWhere,
      },
    ],
  });
}

async function getOneGame(where) {
  return await Game.findOne({
    where,
  });
}

const updateGame = async (where, data) => {
  const updateResponse = await Game.update(data, {
    where,
  });
  const noOfAffectedRows = updateResponse[0];
  return noOfAffectedRows;
};

const updateGameIfGameIdIsValid = async (where, data) => {
  const gameExist = await Game.findOne({
    where,
    attributes: ["id"],
  });

  if (!gameExist) throw new ServiceError("Game not found", 404);

  if (data?.updatedAt) where.updatedAt = { [Op.lte]: data.updatedAt };

  const updateResponse = await Game.update(data, {
    where,
  });
  const noOfAffectedRows = updateResponse[0];
  return noOfAffectedRows;
};

const validateMaxLimitOfPlayersPerGame = async (gameId) => {
  const noOfExistingPlayers = await Game.count({ where: { gameId } });

  if (noOfExistingPlayers == mobileGame.maxNoOfPlayers)
    throw new ServiceError(
      "Limit reached: Max 5 players are allowed in a single game",
      400,
    );
  return true;
};

module.exports = {
  isGameOwner,
  createGame,
  findStatisticsByParticipantId,
  findBestRoundsByParticipantId,
  getGames,
  getOneGame,
  updateGame,
  updateGameIfGameIdIsValid,
  validateMaxLimitOfPlayersPerGame,
};
