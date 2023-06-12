const { Op } = require("sequelize");

const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const { mobileGame } = require("../../config/config");
const { validateObject } = require("../../common/helper");
const holeServices = require("./hole");
const Game = models.Game;
const { Sequelize } = require("sequelize");
async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
  });

  return game;
}

async function findStatisticsByParticipantId(participantId) {
  const where = {
    participantId,
    endTime: { [Op.ne]: null },
  };

  const rounds = await Game.count({
    where,
  });

  if (!rounds) {
    return {
      rounds: rounds,
      bestScore: null,
      worstScore: null,
      avg: null,
      girPercentage: null,
    };
  }

  const scores = await Game.findAll({
    where,
    order: [["score", "ASC"]],
  });

  const totalShotsTaken = await Game.findOne({
    attributes: [
      [Sequelize.fn("SUM", Sequelize.col("totalShotsTaken")), "sum"],
    ],
    where,
    raw: true,
  });

  const girPercentage = await Game.findOne({
    attributes: [[Sequelize.fn("SUM", Sequelize.col("girPercentage")), "sum"]],
    where,
    raw: true,
  });

  return {
    rounds,
    worstScore: scores[scores.length - 1].totalShotsTaken,
    bestScore: scores[0].totalShotsTaken,
    avg: totalShotsTaken.sum / rounds,
    avgGirPercentage: girPercentage.sum / rounds,
  };
}

async function findBestRoundsByParticipantId(participantId, limit = 5) {
  const bestRounds = await Game.findAll({
    attributes: [
      "totalShotsTaken",
      "totalIdealShots",
      "startTime",
      "endTime",
      "score",
      "girPercentage",
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
    order: [[Sequelize.literal("score"), "ASC"]],
    limit,
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

async function getGamesHistoryByParticipantId(participantId) {
  const games = await Game.findAll({
    where: {
      participantId,
    },
    include: [
      {
        as: "Golf_Course",
        model: models.Mobile_Course,
        attributes: ["name"],
      },
    ],
  });

  return games;
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

const createGameForInvitedUser = async (existingGame, invitedUserId) => {
  let response;
  if (existingGame.endTime)
    throw new ServiceError("The game has already ended", 400);
  const holes = await holeServices.getHolesByWhere(
    { gId: existingGame.id },
    { attributes: ["par", "holeNumber", "holeId"] },
  );
  const gameDataForInvitedUser = validateObject(existingGame, [
    "ownerId",
    "orgId",
    "gcId",
    "startTime",
    "teeColor",
    "totalIdealShots",
    "gameId",
  ]);
  gameDataForInvitedUser.participantId = invitedUserId;
  response = await createGame(gameDataForInvitedUser);

  await holeServices.createGameHoles(
    holes,
    invitedUserId,
    response.id,
    gameDataForInvitedUser.gameId,
    gameDataForInvitedUser.gcId,
  );

  return response;
};
const removeUserFromAGame = async (participantId, gameId) => {
  const noOfAffectedRows = await Game.destroy({
    where: { participantId, gameId },
  });

  if (!noOfAffectedRows) throw new ServiceError("Player deletion failed", 404);
  return noOfAffectedRows;
};

const deleteGames = async (where) => {
  await Game.destroy({
    where,
  });
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
  createGameForInvitedUser,
  getGamesHistoryByParticipantId,
  removeUserFromAGame,
  deleteGames,
};
