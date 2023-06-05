const models = require("../../models/index");
const Game = models.Game;
const { Op, Sequelize } = require("sequelize");
async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
  });

  return game;
}

async function findByParticipantId(participantId) {
  console.log(participantId);

  const result = await Game.sequelize.query(`
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


  return result; 

  // response: [
  //   {
  //     "id": 2,
  //     "gcId": 1,
  //     "orgId": 3,
  //     "ownerId": 12,
  //     "participantId": 12,
  //     "participantName": "Golfer",
  //     "startTime": "2023-06-05T13:12:47.000Z",
  //     "endTime": null,
  //     "totalShotsTaken": 17,
  //     "totalIdealShots": 24,
  //     "teeColor": "Red",
  //     "gameId": "6bcbf1cb-bf12-4309-bffa-54531050c3a8",
  //     "createdAt": "2023-06-05T13:12:47.000Z",
  //     "updatedAt": "2023-06-05T13:12:47.000Z"
  //   },
  //   {
  //     "id": 6,
  //     "gcId": 1,
  //     "orgId": 3,
  //     "ownerId": 12,
  //     "participantId": 12,
  //     "participantName": "Golfer",
  //     "startTime": "2023-06-05T13:12:54.000Z",
  //     "endTime": null,
  //     "totalShotsTaken": 8,
  //     "totalIdealShots": 13,
  //     "teeColor": "Red",
  //     "gameId": "5255dcb9-f3a1-4e0d-9070-0347c08a856f",
  //     "createdAt": "2023-06-05T13:12:54.000Z",
  //     "updatedAt": "2023-06-05T13:12:54.000Z"
  //   }
  // ]
}


module.exports = {
  createGame,
  findByParticipantId
};
