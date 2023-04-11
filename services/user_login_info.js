const { logger } = require("../logger");

const models = require("../models");

const settings = require("../config/settings");

const UserLoginInfo = models.User_Login_Info;

module.exports.list = async (user_id) => {
  return await UserLoginInfo.findAll({
    where: { user_id: user_id },
    order: [["id", "DESC"]],
  });
};

exports.findByID = async (id, user_id) => {
  return await UserLoginInfo.findOne({
    where: {
      id: id,
      user_id: user_id,
    },
  });
};

exports.getLastLogin = async (user_id) => {
  return await UserLoginInfo.findOne({
    where: {
      user_id: user_id,
    },
    order: [["id", "DESC"]],
    limit: 1,
  });
};

exports.create = async (params) => {
  return await UserLoginInfo.create(params);
};

UserLoginInfo.addHook("afterCreate", "addUserLoginInfo", async (row) => {
  try {
    let count;
    try {
      count = await UserLoginInfo.count({
        where: { user_id: row.user_id },
      });
    } catch (error) {
      logger.error(`addUserLoginInfo addHook query err ${error.message}`);
    }

    const limit = settings.get("user_login_info_limit") || 5;
    if (count > limit) {
      await UserLoginInfo.destroy({
        where: { user_id: row.user_id },
        order: [["id", "ASC"]],
        limit: 1,
      });
    }
  } catch (err) {
    logger.error(`addUserLoginInfo addHook catch err ${err.message}`);
  }
});
