const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
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
      participantId,
    },
  });

  if(!rounds) return { rounds: rounds , score: {max: null, min: null} }

  const totalSumOfShotsTaken = await Game.findOne({
    attributes: [[Sequelize.fn('SUM', Sequelize.col('totalShotsTaken')), 'sum']],
    where: {
      participantId,
    },
    raw: true,
  });


  const scores = await Game.findAll({
    where: {
     participantId,
    },
    order: [['score', 'ASC']],
  });

  const score = {
    max: scores[scores.length - 1].totalShotsTaken,
    min: scores[0].totalShotsTaken,
    avg: totalSumOfShotsTaken.sum/rounds
  };

  return {
    rounds,
    score
  };
}

async function findBestRoundsByParticipantId(participantId , limit) {

  const bestRounds = await Game.findAll({
    attributes: ["totalShotsTaken","totalIdealShots", "startTime", "endTime" , "score"],
    include: [
      {
        as: "Golf_Course",
        model: models.Mobile_Course,
        attributes: ["name"],
      },
    ],

    where: { participantId: participantId },
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
        attributes: [
          "id",
          "par",
          "noOfShots",
          "isGir",
          "trackedShots",
          "holeNumber",
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

module.exports = {
  isGameOwner,
  createGame,
  findStatisticsByParticipantId,
  findBestRoundsByParticipantId,
  getGame,
  getOneGame,
  updateGame,
};
