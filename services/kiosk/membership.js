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

async function getMembershipById(mId) {
  const membership = await Membership.findOne({
    where: { id: mId },
  });
  if (!membership) throw new ServiceError("Not found", 404);
  return membership;
}

async function getMembershipByCourseId(courseId) {
  const membership = await Membership.findOne({
    where: { gcId: courseId },
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
  getMembershipById,
};
