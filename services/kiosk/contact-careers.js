const models = require("../../models/index");

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
  ContactCareer.findAll({
    where: clonedWhere
  })
}

async function findOneContact(where, loggedInUserOrgId) {
  const clonedWhere = {...where}
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId
  ContactCareer.findOne({
    where: clonedWhere
  })
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
