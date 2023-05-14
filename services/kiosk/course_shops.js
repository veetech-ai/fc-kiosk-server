const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");

const Shop = models.Shop;
const Organization = models.Organization;

exports.createCourseShop = async (reqBody, orgId) => {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new ServiceError(`Organization not found`, 404);
  }

  // Create a new course shop record
  const courseShop = await Shop.create({
    ...reqBody,
    orgId,
  });

  return courseShop;
}