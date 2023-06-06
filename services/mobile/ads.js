const models = require("../../models/index");
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
  if (ad?.bigImage) {
    const image = upload_file.getFileURL(ad.bigImage);
    ad.bigImage = image;
  }
  return ad;
}

module.exports = {
  createAd,
};
