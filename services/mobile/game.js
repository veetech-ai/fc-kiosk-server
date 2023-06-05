const models = require("../../models/index");
const Game = models.Game;

async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
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
  getGame,
};
