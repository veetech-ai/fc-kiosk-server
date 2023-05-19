const models = require("../../models/index");

const ContactCareer = models.Contact_Career;

async function create(body) {
  return await ContactCareer.create(body);
}

async function deleteWhere(where) {
  return await ContactCareer.destroy({ where });
}

module.exports = {
  create,
  deleteWhere,
};
