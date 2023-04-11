const models = require("../models");
const User_Device_Payments = models.User_Device_Payments;

const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.get_device_payments = async (device_id) => {
  return await User_Device_Payments.findAll({
    where: { device_id: device_id },
  });
};

exports.get_user_payments = async (user_id) => {
  return await User_Device_Payments.findAll({
    where: { user_id: user_id },
  });
};

exports.get_user_device_payment = async (params) => {
  return await User_Device_Payments.findOne({
    where: { user_id: params.user_id, device_id: params.device_id },
  });
};

exports.get_by_where = async (where) => {
  return await User_Device_Payments.findAll({
    where: where,
  });
};

exports.get_single_by_where = async (where) => {
  return await User_Device_Payments.findOne({
    where: where,
  });
};

exports.findByWhere = async (where) => {
  return await User_Device_Payments.findAll({
    where: where,
  });
};

exports.create = async (params) => {
  const result = await User_Device_Payments.findOne({
    where: { user_id: params.user_id, device_id: params.device_id },
  });

  if (result) {
    return await User_Device_Payments.update(params, {
      where: { user_id: params.user_id, device_id: params.device_id },
    });
  } else {
    return await User_Device_Payments.create(params);
  }
};

exports.create_only = async (params) => {
  const result = await User_Device_Payments.findOne({
    where: { user_id: params.user_id, device_id: params.device_id },
  });

  if (result) return { message: "exists" };
  return await User_Device_Payments.create(params);
};

exports.update = async (params) => {
  return await User_Device_Payments.update(params, {
    where: { user_id: params.user_id, device_id: params.device_id },
  });
};

exports.billing_devices = async (device_type = false) => {
  const where = {
    bill: true,
    reg_date: { [Op.ne]: null },
  };

  if (device_type) {
    if (device_type.indexOf(",") > -1) {
      device_type = device_type.split(",");
    }
    where.device_type = device_type;
  }

  return await User_Device_Payments.findAll({
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
