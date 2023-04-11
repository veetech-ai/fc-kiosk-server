const randtoken = require("rand-token");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

const models = require("../models");
const Schedule = models.Schedule;

const nameExists = async (scheduleOrgId, name, id = false) => {
  const where = {
    name: name,
    orgId: scheduleOrgId,
  };

  if (id) {
    where.id = {
      [Op.ne]: id,
    };
  }

  try {
    const count = await Schedule.count({
      where: where,
    });
    return count > 0;
  } catch (error) {
    return false;
  }
};

exports.list = async (orgId) => {
  const where = {};
  if (orgId !== null) {
    Object.assign(where, { orgId: { [Op.or]: [null, orgId] } });
  }

  const schedules = await Schedule.findAll({
    where,
    order: [
      ["admin_created", "desc"],
      ["id", "desc"],
    ],
    include: [
      {
        as: "Organization",
        model: models.Organization,
        attributes: ["name"],
      },
    ],
  });

  return schedules;
};

exports.listAll = async (attributes = []) => {
  const query = {};
  if (attributes && attributes.length > 0) query.attributes = attributes;

  return await Schedule.findAll(query);
};

exports.findByID = async (id) => {
  return await Schedule.findOne({
    where: {
      id: id,
    },
  });
};

exports.create = async (params) => {
  const isExists = await nameExists(params.orgId, params.name);
  if (isExists) throw new Error("nameExists");

  params.mqtt_token = randtoken.generate(10);

  return await Schedule.create(params);
};

exports.update = async (id, params) => {
  const isExists = await nameExists(params.orgId, params.name, id);

  if (isExists) throw new Error("nameExists");

  const response = await Schedule.update(params, { where: { id } });
  let updatedSchedule = response;

  if (response.length) {
    updatedSchedule = await Schedule.findOne({ where: { id } });
  }

  return updatedSchedule;
};

exports.delete = async (id) => {
  return await Schedule.destroy({
    where: {
      id: id,
    },
  });
};

exports.find = async (where) => {
  return await Schedule.findOne({
    where,
  });
};
exports.deleteAll = async (where) => {
  return await Schedule.destroy({ where });
};

exports.find = async (where) => {
  return await Schedule.findOne({ where });
};
