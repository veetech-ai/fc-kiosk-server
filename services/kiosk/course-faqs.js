const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");
const upload_file = require("../../common/upload");

const FAQ = models.FAQ;
const Organization = models.Organization;

exports.createCourseShop = async (reqBody, orgId) => {
  // Check if organization exists with the specified org_id
  const organization = await Organization.findOne({ where: { id: orgId } });
  if (!organization) {
    throw new ServiceError(`Organization not found`, 404);
  }

  // Create a new course shop record
  const courseShop = await FAQ.create({
    ...reqBody,
    orgId,
  });

  return courseShop;
};

exports.getCourseFaqs = async (gcId) => {
  const faqs = await FAQ.findAll({
    where: { gcId },
    raw: true,
  });

  if (faqs.length) {
    faqs.forEach((shop) => {
      if (!shop?.image) return;
      const image = upload_file.getFileURL(shop.image);
      shop.image = image;
    });
  }

  return faqs;
};

exports.getCourseShopById = async (id) => {
  const courseShop = await FAQ.findOne({
    where: { id },
  });

  if (!courseShop) {
    throw new ServiceError(`Faq not found`, 404);
  }

  return courseShop;
};

exports.updateCourseShop = async (shopId, reqBody) => {
  await FAQ.update(reqBody, {
    where: { id: shopId },
  });
  const updatedShop = await this.getCourseShopById(shopId);
  return updatedShop;
};

exports.deleteCourseShop = async (shopId) => {
  const courseShop = await FAQ.destroy({
    where: { id: shopId },
  });

  if (!courseShop) {
    throw new ServiceError(`Error deleting shop`, 500);
  }

  return courseShop;
};
