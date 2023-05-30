const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const ContactMembership = models.Contact_Membership;

async function createContactMembership(reqBody) {
  const contactMembership = await ContactMembership.create(reqBody);
  return contactMembership;
}

async function getContactMemberships(where,loggedInUserOrg) {
  let clonedWhere={...where}
  if(loggedInUserOrg) clonedWhere.orgId=loggedInUserOrg
  const contactMembership = await ContactMembership.findAll({
    where: clonedWhere
  });
  return contactMembership;
}

async function getContactMembershipById(where, loggedInUserOrg) {
  let clonedWhere = { ...where };
  if (loggedInUserOrg) clonedWhere.orgId = loggedInUserOrg;
  const contactMembership = await ContactMembership.findOne({
    where: clonedWhere,
  });
  if (!contactMembership) throw new ServiceError("Not found", 404);
  return contactMembership;
}

async function updateContactMemberShipIsAddressable(
  where,
  body,
  loggedInUserOrg,
) {
  let clonedWhere = { ...where };
  if (loggedInUserOrg) clonedWhere.orgId = loggedInUserOrg;
  const contactMembership = await getContactMembershipById(
    where,
    loggedInUserOrg,
  );

  if (contactMembership && Object.keys(contactMembership).length) {
    contactMembership.isAddressed = body.isAddressed;
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
