const models = require("../../models/index");
const AdsModel = models.Ad;
const Course = models.Mobile_Course;
const upload_file = require("../../common/upload");

async function createAd(reqBody) {
  const ad = await AdsModel.create({
    ...reqBody,
  });

  if (ad?.smallImage) {
    const image = upload_file.getFileURL(ad.smallImage);
    ad.smallImage = image;
  }
  if (ad?.bigImage) {
    const image = upload_file.getFileURL(ad.bigImage);
    ad.bigImage = image;
  }
  return ad;
}

async function getAds(where) {
  const ads = await AdsModel.findAll({
    where,
    include: [{ model: Course, as: "Golf_Course", attributes: ["name"] }],
  });
  if (ads.length) {
    for (const ad of ads) {
      if (ad.smallImage) ad.smallImage = upload_file.getFileURL(ad.smallImage);
      if (ad.bigImage) ad.bigImage = upload_file.getFileURL(ad.bigImage);
    }
  }
  return ads;
}

async function deleteAd(where) {
  const ads = await AdsModel.destroy({ where });
  return ads;
}

module.exports = {
  createAd,
  getAds,
  deleteAd,
};
