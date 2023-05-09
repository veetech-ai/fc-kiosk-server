const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const Course = models.Course;
const Membership=models.Membership;
const Organization = models.Organization;

async function createMembership(gcId, orgId) {
  const membership = await Membership.create({
    gcId,
    orgId,
  });

  // Create Screen Config to allow toggling visibility of content sections on kiosk

  return membership;
}
module.exports = {
 createMembership,
};
