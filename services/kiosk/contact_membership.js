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

async function getContactMembershipById(contactMembershipId) {
  const contactMembership = await ContactMembership.findOne({
    where: { id: contactMembershipId },
  });
  if (!contactMembership) throw new ServiceError("Not found", 404);
  return contactMembership;
}

async function updateContactMemberShipIsAddressable(
  contactMembershipId,
  isAddressedBoolean,
) {
  const contactMembership = await getContactMembershipById(contactMembershipId);
  if (contactMembership) {
    contactMembership.isAddressed = isAddressedBoolean;
    await contactMembership.save();
    return "Updated Successfully";
  }
  return "Something went wrong";
}

module.exports = {
  createContactMembership,
  getContactMemberships,
  getContactMembershipById,
  updateContactMemberShipIsAddressable,
};
