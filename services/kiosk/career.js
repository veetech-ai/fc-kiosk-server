const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");

const Career = models.Career;

async function create(body) {
  return await Career.create(body);
}

module.exports = {
  create,
};
