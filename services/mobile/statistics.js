const models = require("../../models/index");
const Statistic = models.Statistic;
async function createStatistic(reqBody) {
  const [statistic, created] = await Statistic.findOrCreate({
    where: { userId: reqBody.userId },
    defaults: { ...reqBody },
  });

  if (!created) {
    // Update the existing row
    await Statistic.update(
      { ...reqBody },
      { where: { userId: reqBody.userId } },
    );
  }

  return statistic;
}

async function getStatistic(userId) {
  const statistic = await Statistic.findOne({ where: { userId } });
  return statistic;
}

module.exports = {
  createStatistic,
  getStatistic,
};
