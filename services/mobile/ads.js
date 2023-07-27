const { Op, literal } = require("sequelize");

const upload_file = require("../../common/upload");
const ServiceError = require("../../utils/serviceError");
const models = require("../../models/index");

const { Ad: AdsModel, Mobile_Course: Course, Course_Ad: CourseAds } = models;

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

/**
 * Delete a row from Course_Ads table
 * @param {Object} options Sequelize `options` object
 * @returns {Promise}
 */
function deleteAssignment(options) {
  return CourseAds.destroy(options);
}

/**
 * Creates an ad entry for given screens of a course
 * @param {Number} courseId `id` of `Mobile_Course`
 * @param {Number} adId `id` of `Ad`
 * @param {String[]} screens List of screens names, to put ad on
 * @returns {Promise<{}>}
 */
async function assignAds(courseId, adId, screens) {
  const course = await Course.findByPk(courseId);

  if (!course) {
    throw new ServiceError(`Course with id: ${courseId} does not exist`, 404);
  }

  const exists = await CourseAds.findOne({ where: { adId, gcId: courseId } });

  if (exists) {
    return CourseAds.update(
      { screens },
      { where: { adId, gcId: courseId }, returning: true },
    );
  }

  return CourseAds.create({
    adId,
    gcId: courseId,
    screens,
  });
}

async function getTotalAdsCount(where) {
  const count = await AdsModel.count({ where });
  return count;
}

async function getAds(where, paginationOptions, searchQuery) {
  let adsList = [],
    totalAdsCount = 0;

  totalAdsCount = await getTotalAdsCount();
  if (totalAdsCount > 0) {
    const countOptions = {
      where: searchQuery ? { ...where, ...searchQuery } : where,
    };
    const totalRecordsCountonSearch = await AdsModel.count(countOptions);
    const options = {
      ...countOptions,
      ...paginationOptions,
    };

    if (searchQuery || Object.keys(where).length != 0) {
      totalAdsCount = totalRecordsCountonSearch;
    }
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

async function deleteAd(where) {
  return await AdsModel.destroy({ where });
}

async function getAd(where, attributes) {
  const ad = await AdsModel.findOne({ where, attributes });

  if (!ad) throw new ServiceError("Ad not found", 404);

  return ad;
}

function updateAd(where, reqBody) {
  if (!Object.keys(reqBody).length) return 0;
  return AdsModel.update({ ...reqBody }, { where, returning: true });
}

function getAdDetail(adId) {
  return AdsModel.findByPk(adId, {
    attributes: ["id", "bigImage", "smallImage", "tapLink", "title"],
    include: [
      {
        as: "Course_Ads",
        model: models.Course_Ad,
        attributes: ["id", "screens"],
        include: [
          {
            as: "Mobile_Courses",
            model: models.Mobile_Course,
            attributes: [
              "id",
              "golfbert_id",
              "name",
              "phone",
              "country",
              "street",
              "city",
              "state",
              "zip",
              "lat",
              "long",
            ],
          },
        ],
      },
    ],
  });
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

    hasAdOnUniqueAdScreens = await Course.findAll({
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
  getAdDetail,
  updateAd,
  checkUniqueness,
  getTotalAdsCount,
  assignAds,
  deleteAssignment,
};
