const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const ContactMembership = models.Contact_Membership;

async function createContactMembership(reqBody) {
  const contactMembership = await ContactMembership.create(reqBody);
  return contactMembership;
}

async function getContactMemberships(membershipId) {
  const contactMembership = await ContactMembership.findAll({
    where: { mId: membershipId },
  });
  return contactMembership;
}

async function getContactMembershipOne(where, loggedInUserOrg) {
  let clonedWhere = { ...where };
  if (loggedInUserOrg) clonedWhere.orgId = loggedInUserOrg;
  const contactMembership = await ContactMembership.findOne({
    where: clonedWhere,
  });
  if (!contactMembership)
    throw new ServiceError("Contact Membership not found", 404);
  return contactMembership;
}

async function updateContactMemberShipIsAddressable(id, body) {
  const contactMembership = await ContactMembership.update(
    { ...body },
    { where: { id } },
  );
  return contactMembership[0];
}

module.exports = {
  createContactMembership,
  getContactMemberships,
  getContactMembershipOne,
  updateContactMemberShipIsAddressable,
};
