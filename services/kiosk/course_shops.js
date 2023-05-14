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

exports.getCourseShops = async (gcId) => {
  const courseShop = await Shop.findAll({
    where: { gcId },
  });

  return courseShop;
}

exports.getCourseShopById = async (id) => {
  const courseShop = await Shop.findOne({
    where: { id },
  });

  if(!courseShop) {
    throw new ServiceError(`Shop not found`, 404);
  }

  return courseShop;
}

exports.updateCourseShop = async (shopId, reqBody) => {
  const courseShop = await Shop.update(reqBody, {
    where: { id: shopId },
  });
  const updatedShop = await this.getCourseShopById(shopId)
  return updatedShop;
}