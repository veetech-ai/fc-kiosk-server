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

  const statistics = await Game.sequelize.query(`
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
`, { plain: true });


  return statistics; 
}


async function findBestRoundsByParticipantId(participantId) {

  const bestRounds = await Game.findAll({
    where: { participantId: participantId },
    order: [['totalIdealShots', 'DESC']],
    limit: 5
  });

  return bestRounds; 
}



module.exports = {
  createGame,
  findStatisticsByParticipantId,
  findBestRoundsByParticipantId
};
