const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const ContactCoach = models.Contact_Coach;

async function createContactCoach(reqBody) {
  const contactCoach = await ContactCoach.create(reqBody);

  return contactCoach;
}

module.exports = {
  createContactCoach,
};
