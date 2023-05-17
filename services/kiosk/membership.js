const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const Membership = models.Membership;

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

async function getMembershipLinkByCourseId(courseId) {
  const membership = await Membership.findOne({
    where: { gcId: courseId },
    attributes: { exclude: ["gc_id", "org_id"] },
  });
  if (!membership) throw new ServiceError("Not found", 404);
  return membership;
}

module.exports = {
  createMembership,
  getMembershipById,
  getMembershipByCourseId,
  getMembershipLinkByCourseId,
};
