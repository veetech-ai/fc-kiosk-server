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

async function getTotalAdsCount(where) {
  const countOptions = {
    where,
    include: [
      {
        model: Course,
        as: "Course",
        attributes: ["name", "state"],
      },
    ],
  };

  const totalAdsCount = await AdsModel.count(countOptions);

  return totalAdsCount;
}

async function getAds(where, paginationOptions) {
  let adsList = [],
    totalAdsCount = 0;
  totalAdsCount = await getTotalAdsCount(where);

  if (totalAdsCount > 0) {
    const options = {
      where,
      include: [
        {
          model: Course,
          as: "Course",
          attributes: ["name", "state"],
        },
      ],
      ...paginationOptions,
    };

    adsList = await AdsModel.findAll(options);

    if (adsList.length) {
      for (const ad of adsList) {
        if (ad.smallImage)
          ad.smallImage = upload_file.getFileURL(ad.smallImage);
        if (ad.bigImage) ad.bigImage = upload_file.getFileURL(ad.bigImage);
      }
    }
  }

  return { adsList, totalAdsCount };
}

async function updateAdsByCourseId(gcId, screens) {
  const ads = await AdsModel.update({ screens }, { where: { gcId } });
  return ads;
}

async function updateAd(where, reqBody, loggedInUserOrgId) {
  const clonedWhere = { ...where };
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const ad = await AdsModel.update(
    {
      ...reqBody,
    },
    { where: clonedWhere },
  );
  return ad[0];
}

async function getAd(where, loggedInUserOrgId) {
  const clonedWhere = { ...where };
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const ad = await AdsModel.findOne({ where: clonedWhere });
  if (!ad) {
    throw new ServiceError("Ad not found", 404);
  }
  ad.smallImage = upload_file.getFileURL(ad.smallImage);

  return ad;
}

async function deleteAd(where, loggedInUserOrgId) {
  const clonedWhere = { ...where };
  if (loggedInUserOrgId) clonedWhere.orgId = loggedInUserOrgId;
  const noOfAffectedRows = await AdsModel.destroy({ where: clonedWhere });
  if (!noOfAffectedRows) {
    throw new ServiceError("Ad not found", 404);
  }
  return noOfAffectedRows;
}

module.exports = {
  createAd,
  getAds,
  updateAdsByCourseId,
  updateAd,
  getAd,
  deleteAd,
};
