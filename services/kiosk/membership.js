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
module.exports = {
  createMembership,
};
