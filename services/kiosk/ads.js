const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const AdsModel = models.Ad;
const upload_file = require("../../common/upload");

async function createAd(reqBody, orgId) {
  const ad = await AdsModel.create({
    ...reqBody,
    orgId,
  });
  if (!ad) {
    throw new ServiceError("Something Went wrong", 400);
  }
  if (ad?.smallImage) {
    const image = upload_file.getFileURL(ad.smallImage);
    ad.smallImage = image;
  }
  return ad;
}

async function getAds() {
  const ads = await AdsModel.findAll({ where: {} });
  if (ads.length) {
    ads.forEach((ad) => {
      ad.smallImage = upload_file.getFileURL(ad.smallImage);
    });
  }
  return ads;
}

module.exports = {
  createAd,
  getAds,
};
