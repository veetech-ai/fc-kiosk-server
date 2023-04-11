const models = require("../models");
const User_Device_Installments = models.User_Device_Installments;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.get_device_installments = async (device_id) => {
  return await User_Device_Installments.findAll({
    where: { device_id: device_id },
  });
};

exports.get_user_installments = async (user_id) => {
  return await User_Device_Installments.findAll({
    where: { user_id: user_id },
  });
};

exports.get_user_device_installments = async (user_id, device_id) => {
  return await User_Device_Installments.findAll({
    where: { user_id: user_id, device_id: device_id },
  });
};

exports.get_by_where = async (where) => {
  return await User_Device_Installments.findAll({
    where: where,
  });
};

exports.get_single_by_where = async (where) => {
  return await User_Device_Installments.findOne({
    where: where,
  });
};

exports.create = async (params) => {
  const result = await User_Device_Installments.findOne({
    where: {
      user_id: params.user_id,
      device_id: params.device_id,
      payment_date: params.payment_date,
    },
  });

  if (result)
    return await User_Device_Installments.update(params, {
      where: {
        user_id: params.user_id,
        device_id: params.device_id,
        payment_date: params.payment_date,
      },
    });
  else return await User_Device_Installments.create(params);
};

exports.update = async (params) => {
  return await User_Device_Installments.update(params, {
    where: { user_id: params.user_id, device_id: params.device_id },
  });
};

exports.billing_devices = async (device_type = false) => {
  const where = {
    bill: true,
    reg_date: { [Op.ne]: null },
    id: 17, // temporary
  };

  if (device_type) {
    if (device_type.indexOf(",") > -1) {
      device_type = device_type.split(",");
    }
    where.device_type = device_type;
  }

  return await User_Device_Installments.findAll({
    where: where,
    include: [
      {
        as: "Owner",
        model: models.User,
        attributes: ["name", "email", "phone"],
      },
      {
        as: "Device_Type",
        model: models.Product,
        attributes: ["title", "description"],
      },
    ],
  });
};
