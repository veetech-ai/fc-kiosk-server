const models = require("../../models/index");
const Membership = models.Membership;

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

module.exports = {
  createMembership,
  updateMembershipLink,
  getMembershipById,
};
