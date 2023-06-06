const models = require("../../models/index");
const Game = models.Game;
const { Op, Sequelize } = require("sequelize");
async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
  });

  return game;
}

async function findStatisticsByParticipantId(participantId) {
  const rounds = await Game.count({
    where: {
      participantId: participantId,
    },
  });

  const bestScore = await Game.findOne({
    where: {
      participantId: participantId,
    },
    attributes: [
      [Sequelize.literal('(totalIdealShots - totalShotsTaken)'), 'difference'],
      'totalShotsTaken',
    ],
    order: [
      [Sequelize.literal('(totalIdealShots - totalShotsTaken)'), 'DESC'],
    ],
    limit: 1,
  });

  const worstScore = await Game.findOne({
    where: {
      participantId: participantId,
    },
    attributes: [
      [Sequelize.literal('(totalIdealShots - totalShotsTaken)'), 'difference'],
      'totalShotsTaken',
    ],
    order: [
      [Sequelize.literal('(totalIdealShots - totalShotsTaken)'), 'ASC'],
    ],
    limit: 1,
  });

  return {
    rounds,
    bestScore: bestScore ? bestScore.totalShotsTaken : null,
    worstScore: worstScore ? worstScore.totalShotsTaken : null,
  };
}

async function findBestRoundsByParticipantId(participantId) {
  const bestRounds = await Game.findAll({
    attributes: ["totalShotsTaken", "startTime", "endTime"],
    include: [
      {
        as: "Mobile_Course",
        model: models.Mobile_Course,
        attributes: ["name"],
      },
    ],

    where: { participantId: participantId },
    order: [[Sequelize.literal("totalIdealShots - totalShotsTaken"), "DESC"]],
    limit: 5,
  });

  return bestRounds;
}

async function getGame(where, holeId = null) {
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
    ],
    include: [
      {
        as: "Holes",
        model: models.Hole,
        attributes: ["id", "par", "noOfShots", "isGir", "trackedShots"],
        where: holeWhere,
      },
    ],
  });
}

module.exports = {
  createGame,
  findStatisticsByParticipantId,
  findBestRoundsByParticipantId,
  getGame,
};
