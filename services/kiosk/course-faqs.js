const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const FAQ = models.FAQ;

exports.create = async (body) => {
  return await FAQ.create(body);
};

exports.getCourseFaqs = async (gcId) => {
  const faqs = await FAQ.findAll({
    where: { gcId },
    attributes: { exclude: ["gc_id", "org_id"] },
    raw: true,
  });

  return faqs;
};

exports.getCourseFaq = async (where, loggedInUserOrgId) => {
  if (loggedInUserOrgId) where.orgId = loggedInUserOrgId;

  const faq = await FAQ.findOne({
    where,
  });

  if (!faq) {
    throw new ServiceError(`Faq not found`, 404);
  }

  return faq;
};

exports.getCourseFaqByCourseId = async (courseId) => {
  const faq = await FAQ.findAll({
    where: { gcId: courseId },
  });

  return faq;
};

exports.updateCourseFaq = async (faqId, reqBody) => {
  const updatedFaq = await FAQ.update(reqBody, {
    where: { id: faqId },
  });

  return updatedFaq;
};

exports.deleteCourseFaq = async (where) => {
  return await FAQ.destroy({ where });
};
