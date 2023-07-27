const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const adsService = require("../../services/mobile/ads");
const helper = require("../../common/helper");
const adsScreenService = require("../../services/mobile/ads-screens");
const ServiceError = require("../../utils/serviceError");
const { Op } = require("sequelize");
const { sequelize } = require("../../models");
const { isValidNumber } = require("../../utils/validators");

/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Web Portal Courses API's for Mobile apps
 */
exports.createAd = async (req, res) => {
  /**
   * @swagger
   *
   * /ads:
   *   post:
   *     security:
   *       - auth: []
   *     description: Create an ad.
   *     tags: [Ads]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: title
   *         description: title of the ad
   *         in: formData
   *         required: false
   *         type: string
   *       - in: formData
   *         name: smallImage
   *         description: Upload image of ads to be displayed
   *         required: false
   *         type: file
   *       - in: formData
   *         name: tapLink
   *         description: Upload tap link of the ad
   *         required: false
   *         type: string
   *       - in: formData
   *         name: bigImage
   *         description: Upload big image link of the ad
   *         required: false
   *         type: file
   *       - in: formData
   *         name: courses
   *         description: A map of course id and corresponding list of screens
   *         required: true
   *         type: object
   *         example: {"1": ["Hole 1", "Hole 2"], "5": ["Hole 4", "Hole 5"]}
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  let transact = null;
  try {
    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      state: "string",
      title: "string",
      tapLink: "string",
      courses: "required",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    const allowedFields = ["courses", "state", "title", "tapLink"];
    const filteredObject = helper.validateObject(fields, allowedFields);

    let { tapLink, courses } = filteredObject;

    if (tapLink && tapLink != "null") {
      const iValidTapLink = helper.regexValidation(tapLink, [
        "email",
        "url",
        "phone",
      ]);

      if (!iValidTapLink) throw new ServiceError("Invalid contact method", 400);
    }

    try {
      courses = Object.entries(JSON.parse(courses));
      if (!courses || !courses.length) throw new Error();
    } catch (err) {
      throw new ServiceError("Invalid courses payload", 400);
    }

    const { smallImage, bigImage } = files;

    if (smallImage) {
      filteredObject.smallImage = await upload_file.upload_file(
        smallImage,
        `uploads/ads-small-image/`,
        ["jpg", "jpeg", "png", "webp"],
      );
    }

    if (bigImage) {
      filteredObject.bigImage = await upload_file.upload_file(
        bigImage,
        `uploads/ads-big-image/`,
        ["jpg", "jpeg", "png", "webp"],
      );
    }

    transact = await sequelize.transaction();

    const postedAd = await adsService.createAd(filteredObject);

    /*
    courses : {
      1: ['screen1', 'screen2'],
      2: ['hole1', 'hole2'],
      47: ['screen1', 'screen2', 'hole1'],
    }
    */

    const mapings = [];

    for (const [gcId, screens] of courses) {
      if (!gcId || !Array.isArray(screens) || !screens.length) {
        throw new ServiceError("List of screens names is required", 400);
      }

      const _gcId = Number.parseInt(gcId);

      if (typeof _gcId !== "number" || isNaN(_gcId)) {
        throw new ServiceError(`Invalid gcId: '${gcId}' in courses payload`);
      }

      await adsScreenService.validateScreens(screens);

      mapings.push(await adsService.assignAds(_gcId, postedAd.id, screens));

      helper.mqtt_publish_message(
        `gc/${gcId}/screens`,
        { action: "ad" },
        false,
      );
    }

    await transact.commit();

    return apiResponse.success(res, req, {
      ...postedAd.dataValues,
      courses: mapings,
    });
  } catch (error) {
    if (transact) transact.rollback();
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getAds = async (req, res) => {
  /**
   * @swagger
   *
   * /ads:
   *   get:
   *     description: GET ads.
   *     tags: [Ads]
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: query
   *         name: gcId
   *         required: false
   *         type: integer
   *         description: The gcId to filter ads.
   *       - in: query
   *         name: pageNumber
   *         required: false
   *         type: integer
   *         description: The page number for pagination.
   *       - in: query
   *         name: pageSize
   *         required: false
   *         type: integer
   *         description: The page size for pagination.
   *       - in: query
   *         name: search
   *         required: false
   *         type: string
   *         description: The term to search in ad's title, ad's updated At, ad's state and course name.
   *     responses:
   *       200:
   *         description: success
   */

  try {
    let searchQuery;
    const { gcId, pageNumber, pageSize, search } = req.query;
    const where = gcId ? { gcId } : {};

    let paginationOptions = {
      limit: pageSize,
      page: pageNumber,
      search,
    };

    paginationOptions = helper.get_pagination_params(paginationOptions);

    if (paginationOptions.search) {
      searchQuery = {
        [Op.or]: [
          { title: { [Op.like]: `%${search}%` } }, // Search for the term in the Ad's title
          // {
          //   "$Golf_Course.name$": {
          //     [Op.like]: `%${search}%`,
          //   },
          // }, // Search for the term in the Golf Course's name
          // {
          //   "$Golf_Course.state$": {
          //     [Op.like]: `%${search}%`,
          //   },
          // }, // Search for the term in the Golf Course's state
        ],
      };
    }
    const ads = await adsService.getAds(where, paginationOptions, searchQuery);

    return apiResponse.pagination(res, req, ads.adsList, ads.totalAdsCount);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getAd = async (req, res) => {
  /**
   * @swagger
   *
   * /ads/{adId}:
   *   get:
   *     description: GET ads.
   *     tags: [Ads]
   *     produces:
   *       - application/json
   *     parameters:
   *       - in: path
   *         name: adId
   *         required: true
   *         type: integer
   *         description: The id of a ad.
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const adId = Number(req.params.adId);
    if (!adId) {
      return apiResponse.fail(res, "adId must be a valid number");
    }
    const ad = await adsService.getAdDetail(adId);

    return apiResponse.success(res, req, ad);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteAd = async (req, res) => {
  /**
   * @swagger
   *
   * /ads/{adId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: admin can delete ads by ad id.
   *     tags: [Ads]
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const adId = Number(req.params.adId);
    if (!adId) return apiResponse.fail(res, "adId must be a valid number", 400);

    const ad = await adsService.getAd({ id: adId });
    await adsService.deleteAd({ id: adId });
    helper.mqtt_publish_message(
      `gc/${ad.gcId}/screens`,
      { action: "ad" },
      false,
    );

    return apiResponse.success(res, req, "Deleted Successfully");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateAd = async (req, res) => {
  /**
   * @swagger
   *
   * /ads/{adId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update ads.
   *     tags: [Ads]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: adId
   *         description: ad id of golf course
   *         in: path
   *         required: true
   *         type: integer
   *       - name: title
   *         description: title of the ad
   *         in: formData
   *         required: false
   *         type: string
   *       - name: tapLink
   *         description: tapLink of the ad
   *         in: formData
   *         required: false
   *         type: string
   *       - in: formData
   *         name: smallImage
   *         description: Upload image of ads to be displayed
   *         required: false
   *         type: file
   *       - in: formData
   *         name: bigImage
   *         description: Upload image of ads to be displayed
   *         required: false
   *         type: file
   *       - in: formData
   *         name: courses
   *         description: A map of gcId and corresponding array of screens
   *         required: true
   *         type: object
   *         example: '{"1": ["Hole 1"], "56": ["Hole 9", "Hole 12"]}'
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  let transact = null;
  try {
    const _adId = req.params.adId;

    if (!isValidNumber(_adId)) {
      return apiResponse.fail(res, "adId must be a valid number");
    }

    const adId = Number.parseInt(_adId);

    await adsService.getAd({ id: adId }, ["id"]);

    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const validation = new Validator(fields, {
      state: "string",
      title: "string",
      tapLink: "string",
      courses: "required",
    });

    if (validation.fails()) return apiResponse.fail(res, validation.errors);

    const allowedFields = ["courses", "state", "title", "tapLink"];
    const filteredObject = helper.validateObject(fields, allowedFields);

    let { tapLink, courses } = filteredObject;

    if (tapLink && tapLink != "null") {
      const iValidTapLink = helper.regexValidation(tapLink, [
        "email",
        "url",
        "phone",
      ]);

      if (!iValidTapLink) throw new ServiceError("Invalid contact method", 400);
    }

    try {
      courses = Object.entries(JSON.parse(courses));
      if (!courses || !courses.length) throw new Error();
    } catch (err) {
      throw new ServiceError("Invalid courses payload", 400);
    }

    const { smallImage, bigImage } = files;

    if (smallImage) {
      filteredObject.smallImage = await upload_file.upload_file(
        smallImage,
        `uploads/ads-small-image/`,
        ["jpg", "jpeg", "png", "webp"],
      );
    }

    if (bigImage) {
      filteredObject.bigImage = await upload_file.upload_file(
        bigImage,
        `uploads/ads-big-image/`,
        ["jpg", "jpeg", "png", "webp"],
      );
    }

    transact = await sequelize.transaction();

    await adsService.updateAd({ id: adId }, filteredObject);

    await adsService.deleteAssignment({
      where: { adId, gcId: { [Op.notIn]: courses.map(([gcId]) => gcId) } },
    });

    const mapings = [];

    for (const [gcId, screens] of courses) {
      if (!isValidNumber(gcId)) {
        throw new ServiceError(`Invalid gcId: '${gcId}' in courses payload`);
      }

      if (!Array.isArray(screens) || !screens.length) {
        throw new ServiceError(
          "Invalid list of screen names in courses payload",
          400,
        );
      }

      await adsScreenService.validateScreens(screens);

      mapings.push(
        await adsService.assignAds(Number.parseInt(gcId), adId, screens),
      );

      helper.mqtt_publish_message(
        `gc/${gcId}/screens`,
        { action: "ad" },
        false,
      );
    }

    await transact.commit();

    return apiResponse.success(res, req, "Record is updated successfully");
  } catch (error) {
    if (transact) transact.rollback();
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
