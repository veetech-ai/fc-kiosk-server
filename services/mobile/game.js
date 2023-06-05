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
  const statistics = await Game.sequelize.query(
    `
         SELECT SUM(totalShotsTaken) AS totalShotsTaken,

         COUNT(*) AS rounds, 

         SUM(totalIdealShots) AS totalIdealShots,

         (SELECT totalShotsTaken
          FROM Games
          WHERE participantId = ${participantId}
          ORDER BY (totalIdealShots - totalShotsTaken) DESC
          LIMIT 1) AS bestScore,

         MAX(totalIdealShots - totalShotsTaken) AS maxDifference,

         (SELECT totalShotsTaken
         FROM Games
         WHERE participantId = ${participantId}
         ORDER BY (totalIdealShots - totalShotsTaken) ASC
         LIMIT 1) AS worstScore,

        MIN(totalIdealShots - totalShotsTaken) AS minDifference

  FROM Games
  WHERE participantId = ${participantId}
`,
    { plain: true },
  );

  return statistics;
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
