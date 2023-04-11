const { logger } = require("../logger");

const models = require("../models");
const UserInvitations = models.User_Invitations;

const alreadyExists = async (email, invite_by_user) => {
  try {
    const count = await UserInvitations.count({
      where: { email: email, invite_by_user: invite_by_user },
    });

    return count > 0;
  } catch (error) {
    logger.error(error);
    return false;
  }
};

exports.list = async () => {
  return await UserInvitations.findAll();
};

exports.list_by_where = async (where, perPage, page) => {
  return await UserInvitations.findAll({
    where: where,
  });
};

exports.findByEmail = async (email) => {
  return await UserInvitations.findOne({
    where: { email: email },
  });
};

exports.findByID = async (id) => {
  return await UserInvitations.findOne({
    where: { id: id },
  });
};

exports.create = async (params) => {
  const isExists = await alreadyExists(params.email, params.invite_by_user);
  if (isExists) throw new Error("exists");

  // Create new
  return await UserInvitations.create(params);
};

exports.update = async (id, params) => {
  try {
    return await UserInvitations.update(params, { where: { id: id } });
  } catch (error) {
    logger.error(error);
    throw new Error("There is a problem. Please try later.");
  }
};

exports.find_by_token = async (token) => {
  return await UserInvitations.findOne({
    where: { invitation_token: token },
  });
};
