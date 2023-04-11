const { logger } = require("../logger");

const models = require("../models");
const UserNetworks = models.User_Networks;

const idExists = async (user_id, ssid) => {
  try {
    const count = await UserNetworks.count({
      where: {
        user_id: user_id,
        ssid: ssid,
      },
    });

    return count > 0;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

module.exports.list = async (user_id, perPage, page) => {
  return await UserNetworks.findAll({
    where: { user_id: user_id },
  });
};

exports.findByWhere = async (where) => {
  return await UserNetworks.findOne({
    where: where,
  });
};

exports.findByID = async (id) => {
  return await UserNetworks.findOne({
    where: {
      id: id,
    },
  });
};

exports.create = async (params) => {
  const isExists = await idExists(params.user_id, params.ssid);

  if (isExists) throw new Error("exists");

  // Create new
  return await UserNetworks.create(params);
};

exports.delete = async (where) => {
  const result = await UserNetworks.destroy({ where: where });

  if (result) return result;
  else throw new Error("There is a problem. Please try later.");
};
