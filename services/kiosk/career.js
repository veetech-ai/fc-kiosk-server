const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const Career = models.Career;

async function createCareer(body) {
  return await Career.create(body);
}

async function deleteCareersWhere(where, loggedInUserOrgId = null) {
  if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;
  const noOfAffectedRows = await Career.destroy({ where });
  if (!noOfAffectedRows) {
    throw new ServiceError("Career not found", 404);
  }
  return noOfAffectedRows;
}

async function findCareers(where, loggedInUserOrgId) {
  if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;
  return await Career.findAll({ where });
}

async function findOneCareer(where, loggedInUserOrgId) {
  if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;
  const career = await Career.findOne({ where });
  if (!career) throw new ServiceError("Career not found", 404);

  return career;
}

async function updateCareerById(id, body) {
  const career = await Career.update(body, { where: { id } });
  return career[0];
}

module.exports = {
  createCareer,
  deleteCareersWhere,
  findCareers,
  findOneCareer,
  updateCareerById,
};
