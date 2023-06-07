const { Op } = require("sequelize");

const models = require("../../models/index");
const Hole = models.Hole;

async function createGameHoles(holes, userId, gId, gameId, courseId) {
  holes.forEach((hole) => {
    hole.userId = userId;
    hole.gcId = courseId;
    hole.gId = gId;
    hole.gameId = gameId;
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

async function updateHoleByWhere(where, data) {
  const updateResponse = await Hole.update(data, {
    where: { ...where, updatedAt: { [Op.lte]: data.updatedAt } },
  });

  return updateResponse[0];
}

async function getHoleByWhere(where) {
  return await Hole.findOne({
    where,
  });
}

module.exports = {
  createGameHoles,
  getGameHole,
  updateHoleByWhere,
  getHoleByWhere,
};
