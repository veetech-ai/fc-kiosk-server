const models = require("../models");
const User_Addresses = models.User_Addresses;

exports.list = async (user_id) => {
  return await User_Addresses.findAll({
    attributes: ["id", "address", "is_default"],
    where: { user_id: user_id },
  });
};

exports.findByWhere = async (where) => {
  return await User_Addresses.findOne({
    where: where,
    attributes: ["id", "address", "is_default"],
  });
};

exports.findByID = async (id, user_id) => {
  return await User_Addresses.findOne({
    attributes: ["id", "address", "is_default"],
    where: {
      id: id,
      user_id: user_id,
    },
  });
};

exports.create = async (params) => {
  return await User_Addresses.create(params);
};

exports.update = async (id, params) => {
  return await User_Addresses.update(params, {
    where: {
      id: id,
      user_id: params.user_id,
    },
  });
};

exports.delete = async (id, user_id) => {
  return await User_Addresses.destroy({
    where: {
      id: id,
      user_id: user_id,
    },
  });
};

exports.makeDefaultAddress = async (id, user_id) => {
  await User_Addresses.update(
    { is_default: 0 },
    { where: { user_id: user_id, is_default: 1 } },
  );

  return await User_Addresses.update(
    { is_default: 1 },
    {
      where: {
        id: id,
        user_id: user_id,
      },
    },
  );
};
