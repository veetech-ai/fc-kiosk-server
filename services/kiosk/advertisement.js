const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const screenConfigServices = require("../screenConfig/screens");
const membershipService = require("./membership");
const organizationService = require("../organization");

const Course = models.Course;
const Organization = models.Organization;
const AdModel = models.Ad;

async function createAdvertisement(reqBody, gcId) {
  const ad = await AdModel.create({
    ...reqBody,
    gcId,
  });
  return ad;
}
async function getAllAdvertisements(orgId) {
  
  // const ad = await AdModel.create({
  //   ...reqBody,
  //   gcId,
  // });
  // return ad;
}



module.exports = {
  createAdvertisement,
  getAllAdvertisements
};
