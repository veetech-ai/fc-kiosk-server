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
  if(!ad)   throw new ServiceError("Could not add, Please try again!", 500);
  return ad;
}
async function getAllAdvertisements() {

 const ads = await AdModel.findAll();
 if(!ads)   throw new ServiceError("Found No data!", 404);
 return ads;

}



module.exports = {
  createAdvertisement,
  getAllAdvertisements
};
