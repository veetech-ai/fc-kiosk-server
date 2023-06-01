const models = require("../../models/index");
const Membership = models.Membership;
const ServiceError = require("../../utils/serviceError");

async function createMembership(gcId, orgId) {
  const membership = await Membership.create({
    gcId,
    orgId,
  });

  return membership;
}

async function getOneMembership(where, loggedInUserOrg) {
  let clonedWhere = { ...where };
  if (loggedInUserOrg) clonedWhere.orgId = loggedInUserOrg;
  const membership = await Membership.findOne({
    where: clonedWhere,
  });
  if (!membership) throw new ServiceError("Membership not found", 404);
  return membership;
}

async function getMembershipByCourseId(courseId) {
  const membership = await Membership.findOne({
    where: { gcId: courseId },
    attributes: { exclude: ["org_id", "gc_id"] },
  });
  if (!membership) throw new ServiceError("Not found", 404);
  return membership;
}

async function updateMembershipLink(membershipId, reqBody) {
  const [affectedRows] = await Membership.update(
    { ...reqBody },
    { where: { id: membershipId } },
  );

  return affectedRows;
}

module.exports = {
  createMembership,
  updateMembershipLink,
  getMembershipByCourseId,
  getOneMembership,
};
