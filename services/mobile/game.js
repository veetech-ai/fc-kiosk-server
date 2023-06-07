const { Op } = require("sequelize");

const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Game = models.Game;

async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
  });

  return game;
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

module.exports = {
  isGameOwner,
  createGame,
  getGame,
  getOneGame,
  updateGameIfGameIdIsValid,
};
