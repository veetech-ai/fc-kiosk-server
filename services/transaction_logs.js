const models = require("../models");

const sequelize = models.sequelize;
const TransactionLogsModel = models.Transaction_Logs;

const { logger } = require("../logger");

exports.save = async (params) => {
  return await TransactionLogsModel.create(params);
};

exports.getAvgScreensTime = async ({ user_id, device_id = null }) => {
  if (!user_id) {
    throw new Error("user_id not provided");
  }

  let deviceIdWhereClause = "";
  if (device_id) deviceIdWhereClause = `and d.id = ${device_id}`;

  const result = await sequelize.query(`
      SELECT
      JSON_EXTRACT(tl.data, "$.screen") as screen , AVG(JSON_EXTRACT(tl.data, "$.time")) as totalTime
      FROM Transaction_Logs tl
      join Devices d on tl.device_id = d.id and d.owner_id = ${user_id} ${deviceIdWhereClause}
      WHERE tl.type = 'screen_time'
      group by screen
      `);
  return result[0];
};

exports.getAvgTypeTime = async ({ user_id, device_id = null }) => {
  if (!user_id) {
    throw new Error("user_id not provided");
  }

  let deviceIdWhereClause = "";
  if (device_id) {
    deviceIdWhereClause = `and d.id = ${device_id}`;
  }

  const result = await sequelize.query(`
      SELECT 
        tl.type, AVG(JSON_EXTRACT(tl.data, "$.time")) as totalTime
        FROM Transaction_Logs tl
        join Devices d on tl.device_id = d.id and d.owner_id = ${user_id} ${deviceIdWhereClause}
        group by tl.type
    `);

  return result[0];
};
