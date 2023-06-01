const models = require("../../models/index");
const Hole = models.Hole;

async function createGameHoles(holes, userId, gId, courseId) {
    holes.forEach((hole) => {
      hole.userId = userId;
      hole.mcId = courseId;
      hole.gId = gId;
    });
    return Hole.bulkCreate(holes)
  };

module.exports = {
    createGameHoles,
};
