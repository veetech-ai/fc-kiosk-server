const { FAQ } = require("../../models");
const ServiceError = require("../../utils/serviceError");

exports.createFAQ = async function (body) {
  return await FAQ.create(body);
};

exports.getFAQs = async () => {
  const faq = await FAQ.findAll();

  return faq;
};

exports.deleteFAQs = async () => {
  const noOfAffectedRows = await FAQ.destroy({
    where: {}, // Add the where parameter here
  });
  return noOfAffectedRows;
};
