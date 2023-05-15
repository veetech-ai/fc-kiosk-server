const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");
const upload_file = require("../../common/upload");

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
};

exports.getCourseShops = async (gcId) => {
  const shops = await Shop.findAll({
    where: { gcId },
    raw: true,
  });

  if (shops.length) {
    shops.forEach((shop) => {
      if (!shop?.image) return;
      const image = upload_file.getFileURL(shop.image);
      shop.image = image;
    });
  }

  return shops;
};

exports.getCourseShopById = async (id) => {
  const courseShop = await Shop.findOne({
    where: { id },
  });

  if (!courseShop) {
    throw new ServiceError(`Shop not found`, 404);
  }

  return courseShop;
};

exports.updateCourseShop = async (shopId, reqBody) => {
  await Shop.update(reqBody, {
    where: { id: shopId },
  });
  const updatedShop = await this.getCourseShopById(shopId);
  return updatedShop;
};

exports.deleteCourseShop = async (shopId) => {
  const courseShop = await Shop.destroy({
    where: { id: shopId },
  });

  if (!courseShop) {
    throw new ServiceError(`Error deleting shop`, 500);
  }

  return courseShop;
};
