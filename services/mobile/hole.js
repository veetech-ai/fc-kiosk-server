const models = require("../../models/index");
const Hole = models.Hole;

async function createGameHoles(holes, userId, gId, courseId) {
  holes.forEach((hole) => {
    hole.userId = userId;
    hole.gcId = courseId;
    hole.gId = gId;
  });
  return Hole.bulkCreate(holes);
}

async function getGameHole(gId) {
  return Hole.findAll({
    where: {
      gId,
    },
    attributes: ["id", "userId", "par", "noOfShots", "isGir", "trackedShots"],
    include: [
      {
        model: models.User,
        attributes: ["id", "name"],
      },
    ],
  });
}

module.exports = {
  createGameHoles,
  getGameHole,
};
