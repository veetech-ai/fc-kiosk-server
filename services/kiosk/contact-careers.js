const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const ContactCareer = models.Contact_Career;

async function create(body) {
  return await ContactCareer.create(body);
}

async function deleteWhere(where) {
  return await ContactCareer.destroy({ where });
}

async function findContacts(where, loggedInUserOrgId) {
  const clonedWhere = {...where}
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId
  return await ContactCareer.findAll({
    where: clonedWhere
  })
}

async function findOneContact(where, loggedInUserOrgId) {
  const clonedWhere = {...where}
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId
  const contactRequest = await ContactCareer.findOne({
    where: clonedWhere
  })

  if (!contactRequest) {
    throw new ServiceError("Contact request not found", 404);
  }
  return contactRequest
}

async function updateCareerContactById(id, body) {
  const career = await ContactCareer.update({ ...body }, { where: { id } });
  return career[0];
}
module.exports = {
  create,
  deleteWhere,
  findContacts,
  findOneContact,
  updateCareerContactById
};
