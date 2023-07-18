const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const courseService = require("../../services/kiosk/course");
const adsService = require("../../services/kiosk/ads");
const screenConfigService = require("../../services/screenConfig/screens");
const helper = require("../../common/helper");
const { validateObject } = require("../../common/helper");
const { Op } = require("sequelize");
/**
 * @swagger
 * tags:
 *   name: Ads
 *   description: Web Portal Courses API's
 */
exports.createAd = async (req, res) => {
  /**
   * @swagger
   *
   * /ads:
   *   post:
   *     security:
   *       - auth: []
   *     description: CREATE ads.
   *     tags: [Ads]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: gcId
   *         description: id of golf course
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: state
   *         description: select which state to present the ads in
   *         in: formData
   *         required: false
   *         type: string
   *       - name: title
   *         description: title of the ad
   *         in: formData
   *         required: false
   *         type: string
   *       - in: formData
   *         name: adImage
   *         description: Upload image of ads to be displayed
   *         required: true
   *         type: file
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;

    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const validation = new Validator(fields, {
      gcId: "required|integer",
      state: "string",
      title: "string",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const linkedCourse = await courseService.getCourse(
      { id: fields.gcId },
      loggedInUserOrg,
    );
    const courseId = fields.gcId;
    const adImage = files.adImage;

    const screens = await screenConfigService.getScreensByCourses(courseId);
    const { updatedAt, orgId, gcId, id, createdAt, ...restFields } =
      screens.dataValues;
    const screensList = { ...restFields };
    const enabledScreens = Object.keys(screensList).filter(
      (key) => screensList[key] === true,
    );
    const smallImage = await upload_file.uploadImageForCourse(
      adImage,
      courseId,
    );
    const allowedFields = ["gcId", "state", "title"];
    const filteredObject = validateObject(fields, allowedFields);
    const reqBody = {
      ...filteredObject,
      smallImage,
      orgId,
      screens: enabledScreens,
    };
    const postedAd = await adsService.createAd(reqBody);

    helper.mqtt_publish_message(
      `gc/${postedAd.gcId}/screens`,
      helper.mqttPayloads.onAdUpdate,
      false,
    );

    return apiResponse.success(res, req, postedAd);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getAds = async (req, res) => {
  /**
   * @swagger
   *
   * /ads:
   *   get:
   *     security:
   *       - auth: []
   *     description: GET ads.
   *     tags: [Ads]
   *     produces:
   *       - application/json
   *     parameters:
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
    const { pageNumber, pageSize, search } = req.query;

    const where = {};
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } }, // Search for the term in the Ad's title
        {
          "$Course.name$": {
            [Op.like]: `%${search}%`,
          },
        }, // Search for the term in the Course's name
        {
          "$Course.state$": {
            [Op.like]: `%${search}%`,
          },
        }, // Search for the term in the Course's state
      ];
    }

    const paginationOptions = {
      limit: parseInt(pageSize, 10), // Convert pageSize to an integer
      page: parseInt(pageNumber, 10), // Convert pageNumber to an integer
    };

    const ads = await adsService.getAds(where, paginationOptions);

    return apiResponse.pagination(res, req, ads.adsList, ads.totalAdsCount);
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
   *       - in: formData
   *         name: adImage
   *         description: Upload image of ads to be displayed
   *         required: false
   *         type: file
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;
    const adId = Number(req.params.adId);
    if (!adId) {
      return apiResponse.fail(res, "adId must be a valid number");
    }
    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const validation = new Validator(fields, {
      title: "string",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const adImage = files.adImage;
    const ad = await adsService.getAd({ id: adId }, loggedInUserOrg);
    const courseId = ad.dataValues.gcId;
    if (adImage) {
      const smallImage = await upload_file.uploadImageForCourse(
        adImage,
        courseId,
      );
      fields.smallImage = smallImage;
    }
    const allowedFields = ["title", "smallImage"];
    const filteredObject = validateObject(fields, allowedFields);
    const reqBody = filteredObject;

    const noOfRowsUpdated = await adsService.updateAd(
      { id: adId },
      reqBody,
      loggedInUserOrg,
    );

    helper.mqtt_publish_message(
      `gc/${ad.gcId}/screens`,
      helper.mqttPayloads.onAdUpdate,
      false,
    );

    return apiResponse.success(
      res,
      req,
      noOfRowsUpdated ? "Ad updated successfully" : "Ad already up to date",
    );
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
   *     description: delete ads.
   *     tags: [Ads]
   *     parameters:
   *       - name: adId
   *         description: Ad id
   *         in: path
   *         required: true
   *         type: integer
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;
    const adId = Number(req.params.adId);
    if (!adId) {
      return apiResponse.fail(res, "adId must be a valid number");
    }
    const ad = await adsService.getAd({ id: adId }, loggedInUserOrg);
    const noOfAffectedRows = await adsService.deleteAd(
      { id: adId },
      loggedInUserOrg,
    );

    helper.mqtt_publish_message(
      `gc/${ad.gcId}/screens`,
      helper.mqttPayloads.onAdUpdate,
      false,
    );

    return apiResponse.success(res, req, "Ad deleted successfully");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
