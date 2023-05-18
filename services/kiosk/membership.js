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

async function updateMembershipLink(membershipId, reqBody) {
  const [affectedRows] = await Membership.update(
    { ...reqBody },
    { where: { id: membershipId } },
  );

  return affectedRows;
}

async function getMembershipById(membershipId) {
  const membership = await Membership.findOne({ where: { id: membershipId } });

  return membership;
}

async function getMembershipByCourseId(courseId) {
  const membership = await Membership.findOne({
    where: { gcId: courseId },
  });
  if (!membership) throw new ServiceError("Not found", 404);
  return membership;
}

module.exports = {
  createMembership,
  updateMembershipLink,
  getMembershipById,
  getMembershipByCourseId,
};
