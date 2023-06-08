const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const adsService = require("../../services/mobile/ads");
const helper = require("../../common/helper");
const adsScreenService = require("../../services/mobile/ads-screens");
const ServiceError = require("../../utils/serviceError");

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
   *         name: screens
   *         description: Multi-select options in JSON format such as ['Hole 1' , 'Hole 2']
   *         required: true
   *         type: object
   *         example: ['Hole 1', 'Hole 2']
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
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
      tapLink: "string",
      screens: "required",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    let reqBody = {};
    const courseId = fields.gcId;
    const adSmallImage = files.smallImage;
    const adBigImage = files.bigImage;

    if (typeof fields.screens === "string") {
      try {
        fields.screens = JSON.parse(fields.screens);
      } catch (error) {
        throw new ServiceError("Invalid JSON in screens", 400);
      }
    }
    if (!fields.screens || !fields.screens.length) {
      throw new ServiceError("Screens field cannot be null", 400);
    }
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    await adsScreenService.validateScreens(fields.screens);
    await adsService.checkUniqueness(fields.screens, courseId);

    if (adSmallImage) {
      const smallImage = await upload_file.upload_file(
        adSmallImage,
        `uploads/ads-small-image/${courseId}`,
        ["jpg", "jpeg", "png", "webp"],
      );
      reqBody.smallImage = smallImage;
    }
    if (adBigImage) {
      const bigImage = await upload_file.upload_file(
        adBigImage,
        `uploads/ads-big-image/${courseId}`,
        ["jpg", "jpeg", "png", "webp"],
      );
      reqBody.bigImage = bigImage;
    }
    const allowedFields = ["gcId", "state", "title", "tapLink", "screens"];
    const filteredObject = helper.validateObject(fields, allowedFields);
    reqBody = {
      ...reqBody,
      ...filteredObject,
    };

    const postedAd = await adsService.createAd(reqBody);

    helper.mqtt_publish_message(`gc/${courseId}/screens`, { action: "ad" });

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
   *     responses:
   *       200:
   *         description: success
   */

  try {
    let where = {};
    if (req.query.gcId) {
      where.gcId = req.query.gcId;
    }
    const ads = await adsService.getAds(where);
    return apiResponse.success(res, req, ads);
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
   *         name: screens
   *         description: Multi-select options in JSON format such as ['Hole 1' , 'Hole 2']
   *         required: false
   *         type: object
   *         example: ['Hole 1', 'Hole 2']
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const adId = Number(req.params.adId);
    if (!adId) {
      return apiResponse.fail(res, "adId must be a valid number");
    }
    const ad = await adsService.getAd({ id: adId });
    const courseId = ad.gcId;
    const form = new formidable.IncomingForm();

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const validation = new Validator(fields, {
      title: "string",
      tapLink: "string",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const adSmallImage = files?.smallImage;
    let adBigImage = files?.bigImage;

    if (typeof fields.screens === "string") {
      try {
        fields.screens = JSON.parse(fields.screens);
      } catch (error) {
        throw new ServiceError("Invalid JSON in screens", 400);
      }
    }
    if (!fields.screens || !fields.screens.length) {
      throw new ServiceError("Screens field cannot be null", 400);
    }
    await adsScreenService.validateScreens(fields.screens);
    await adsService.checkUniqueness(fields.screens, courseId, adId);
    fields.screens = Array.from(new Set(fields.screens));

    if (adSmallImage) {
      const smallImage = await upload_file.upload_file(
        adSmallImage,
        `uploads/ads-small-image/${courseId}`,
        ["jpg", "jpeg", "png", "webp"],
      );
      fields.smallImage = smallImage;
    }
    if (adBigImage) {
      const bigImage = await upload_file.upload_file(
        adBigImage,
        `uploads/ads-small-image/${courseId}`,
        ["jpg", "jpeg", "png", "webp"],
      );
      fields.bigImage = bigImage;
    }
    const allowedFields = [
      "title",
      "tapLink",
      "smallImage",
      "bigImage",
      "screens",
    ];
    const filteredObject = helper.validateObject(fields, allowedFields);
    if (filteredObject.bigImage === "null") {
      filteredObject.bigImage = null;
    }
    if (filteredObject.tapLink === "null") {
      filteredObject.tapLink = null;
    }
    const reqBody = filteredObject;
    const updatedAd = await adsService.updateAd({ id: adId }, reqBody);

    if (updatedAd) {
      helper.mqtt_publish_message(`gc/${courseId}/screens`, { action: "ad" });
    }

    return apiResponse.success(
      res,
      req,
      updatedAd ? "Updated Successfuly" : "Already Updated",
    );
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

// exports.deleteAd = async (req, res) => {
//   /**
//    * @swagger
//    *
//    * /ads/{adId}:
//    *   delete:
//    *     security:
//    *       - auth: []
//    *     description: delete ads.
//    *     tags: [Ads]
//    *     parameters:
//    *       - name: adId
//    *         description: Ad id
//    *         in: path
//    *         required: true
//    *         type: integer
//    *     produces:
//    *       - application/json
//    *     responses:
//    *       200:
//    *         description: success
//    */

//   try {
//     const loggedInUserOrg = req.user?.orgId;
//     const adId = Number(req.params.adId);
//     if (!adId) {
//       return apiResponse.fail(res, "adId must be a valid number");
//     }
//     const ad = await adsService.getAd({ id: adId }, loggedInUserOrg);
//     const noOfAffectedRows = await adsService.deleteAd(
//       { id: adId },
//       loggedInUserOrg,
//     );

//     helper.mqtt_publish_message(
//       `gc/${ad.gcId}/screens`,
//       helper.mqttPayloads.onAdUpdate,
//       false,
//     );

//     return apiResponse.success(res, req, "Ad deleted successfully");
//   } catch (error) {
//     return apiResponse.fail(res, error.message, error.statusCode || 500);
//   }
// };
