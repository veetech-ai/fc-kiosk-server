const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const Career = models.Career;

async function create(body) {
  return await Career.create(body);
}

async function deleteWhere(where) {
  return await Career.destroy({ where });
}

async function find(where, loggedInUserOrgId) {
  if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;
  return await Career.findAll({ where });
}

async function findOne(where) {
  const career = await Career.findOne({ where });
  if (!career) throw new ServiceError("Career not found", 404);
}

module.exports = {
  create,
  deleteWhere,
  find,
  findOne,
};
