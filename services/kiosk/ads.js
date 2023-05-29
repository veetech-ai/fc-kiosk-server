const models = require("../../models/index");
const ServiceError = require("../../utils/serviceError");
const AdsModel = models.Ad;
const Course = models.Course;
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

async function getAds(where, loggedInUserOrgId) {
  const clonedWhere = where;
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const ads = await AdsModel.findAll({
    where: clonedWhere,
    include: [
      {
        model: Course,
        as: "Course",
        attributes: ["name"],
      },
    ],
  });
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

async function updateAd(where, reqBody, loggedInUserOrgId) {
  const clonedWhere = where;
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const ad = await AdsModel.update(
    {
      ...reqBody,
    },
    { where: clonedWhere },
  );
  if (!ad) throw new ServiceError("Not found", 404);
  return ad[0];
}

async function getAd(where, loggedInUserOrgId) {
  const clonedWhere = where;
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const ad = await AdsModel.findOne({ where: clonedWhere });
  if (!ad) {
    throw new ServiceError("Not found", 404);
  }
  ad.smallImage = upload_file.getFileURL(ad.smallImage);

  return ad;
}

module.exports = {
  createAd,
  getAds,
  updateAdsByCourseId,
  updateAd,
  getAd,
};
