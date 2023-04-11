const models = require("../models");
const User2FAModel = models.User_2fa;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.findByWhere = async (where) => {
  return await User2FAModel.findOne({
    attributes: ["id", "user_id", "type", "status"],
    where: where,
  });
};

exports.findByID = async (user_id, additional_select = []) => {
  let select = ["id", "user_id", "type", "status"];
  if (additional_select.length > 0) {
    select = select.concat(additional_select);
  }

  return await User2FAModel.findOne({
    attributes: select,
    where: {
      user_id: user_id,
    },
  });
};

exports.save = async (params) => {
  const settings = await this.findByID(params.user_id);
  if (settings)
    return await User2FAModel.update(params, {
      where: {
        user_id: params.user_id,
      },
    });

  return await User2FAModel.create(params);
};

exports.validate_code = async (params) => {
  const data = await User2FAModel.findOne({
    where: {
      user_id: params.user_id,
      code: params.code,
      expiry: { [Op.gt]: new Date() },
    },
  });

  if (!data) throw new Error("Invalid code or code may expire");

  await User2FAModel.update(
    { code: null, expiry: null, resend_tries: 0, last_send: null },
    {
      where: {
        user_id: params.user_id,
      },
    },
  );

  return data;
};

module.exports.model = require("../models/user_2fa");
