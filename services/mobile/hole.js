const { Op, Sequelize } = require("sequelize");

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
  const updateResponse = await Hole.update(
    { ...data, trackedShots: JSON.parse(data.trackedShots) },
    {
      where: { ...where, updatedAt: { [Op.lte]: data.updatedAt } },
    },
  );

  return updateResponse[0];
}

async function getHoleByWhere(where) {
  return await Hole.findOne({
    where,
  });
}

async function getHolesByWhere(
  where,
  { attributes = null, isRaw = true } = {},
) {
  const findAllParams = {
    where,
    raw: isRaw,
  };
  if (attributes) findAllParams.attributes = attributes;
  return await Hole.findAll({ ...findAllParams });
}

async function getUserTotalShotsTakenForGameHoles(userId, gameId) {
  const findAllParams = {
    where: { userId, gameId },
    attributes: [[Sequelize.fn("SUM", Sequelize.col("noOfShots")), "sum"]],
    raw: true,
  };

  const scoreSum = await Hole.findAll(findAllParams);
  let scoreSumReturnValue = +scoreSum[0]?.sum || 0;

  return scoreSumReturnValue;
}

module.exports = {
  createGameHoles,
  getGameHole,
  updateHoleByWhere,
  getHoleByWhere,
  getHolesByWhere,
  getUserTotalShotsTakenForGameHoles,
};
