const models = require("../../models/index");
const AdsModel = models.Ad;
const Course = models.Mobile_Course;
const upload_file = require("../../common/upload");
const { Op, literal } = require("sequelize");
const ServiceError = require("../../utils/serviceError");

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
  return await AdsModel.destroy({ where });
}

async function getAd(where) {
  const ad = await AdsModel.findOne({
    where,
  });
  if (!ad) {
    throw new ServiceError("Ad not found", 404);
  }
  return ad;
}

async function updateAd(where, reqBody) {
  if (!Object.keys(reqBody).length) return 0;
  const existingAd = await getAd(where);
  const updatedData = { ...existingAd.dataValues, ...reqBody };
  const updatedAd = await AdsModel.update({ ...updatedData }, { where });

  return 1;
}

const checkUniqueness = async (inputedScreens, gcId, adId) => {
  let hasAdOnUniqueAdScreens;
  let filteredScreens = inputedScreens.filter(
    (item) => item !== "Add player" && item !== "Scorecard",
  );

  for (const filteredScreen of filteredScreens) {
    const whereCondition = {
      screens: literal(`JSON_CONTAINS(screens, '["${filteredScreen}"]')`),
      gcId,
    };

    if (adId) {
      whereCondition.id = {
        [Op.ne]: adId,
      };
    }

    hasAdOnUniqueAdScreens = await AdsModel.findAll({
      where: whereCondition,
    });

    if (hasAdOnUniqueAdScreens.length) {
      throw new ServiceError("Screen Occupied", 400);
    }
  }
};
module.exports = {
  createAd,
  getAds,
  deleteAd,
  getAd,
  updateAd,
  checkUniqueness,
};
