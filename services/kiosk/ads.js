const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const AdsModel = models.Ad;
const upload_file = require("../../common/upload");

async function createAd(reqBody) {
  const ad = await AdsModel.create({
    ...reqBody,
  });

  if (ad?.smallImage) {
    const image = upload_file.getFileURL(ad.smallImage);
    ad.smallImage = image;
  }
  return ad;
}

async function getAds(where) {
  const ads = await AdsModel.findAll({where});
  if (ads.length) {
    ads.forEach((ad) => {
      ad.smallImage = upload_file.getFileURL(ad.smallImage);
    });
  }
  return ads;
}

async function updateAdsByCourseId(gcId, screens) {
  const ads = await AdsModel.update({ screens }, { where: { gcId } });
  return ads;
}

module.exports = {
  createAd,
  getAds,
  updateAdsByCourseId,
};
