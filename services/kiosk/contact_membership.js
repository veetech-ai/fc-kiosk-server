const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const ContactMembership = models.Contact_Membership;

async function createContactMembership(reqBody) {
  const contactMembership = await ContactMembership.create(reqBody);
  return contactMembership;
}

async function getContactMembership(membershipId) {
  const contactMembership = await ContactMembership.findAll({where:{mId:membershipId}});
  return contactMembership;
}

module.exports = {
  createContactMembership,
  getContactMembership
};
