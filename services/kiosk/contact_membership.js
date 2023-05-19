const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const ContactMembership = models.Contact_Membership;

async function createContactMembership(reqBody) {
  const contactMembership = await ContactMembership.create(reqBody);
  return contactMembership;
}

async function getContactMembership(membershipId) {
  const contactMembership = await ContactMembership.findAll({
    where: { mId: membershipId },
  });
  return contactMembership;
}

async function getContactMembershipById(contactMembershipId) {
  const contactMembership = await ContactMembership.findOne({
    where: { id: contactMembershipId },
  });
  if (!contactMembership) throw new ServiceError("Not found", 404);
  return contactMembership;
}

async function updateContactMemeberShipIsAddressable(
  contactMemebershipId,
  isAddressedBoolean,
) {
  const [affectedRows] = await ContactMembership.findOne();

  return affectedRows;
}

module.exports = {
  createContactMembership,
  getContactMembership,
  getContactMembershipById,
  updateContactMemeberShipIsAddressable,
};
