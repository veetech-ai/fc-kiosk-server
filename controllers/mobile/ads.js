const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const courseService = require("../../services/mobile/courses");
const adsService = require("../../services/mobile/ads");
// const screenConfigService = require("../../services/screenConfig/screens");
const helper = require("../../common/helper");
// const { validateObject } = require("../../common/helper");

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
   *         type: string
   *         format: json
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
      screens: "json",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    let reqBody = {};
    const courseId = fields.gcId;
    const adSmallImage = files.smallImage;
    const adBigImage = files.bigImage;

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

    // helper.mqtt_publish_message(
    //   `gc/${postedAd.gcId}/screens`,
    //   helper.mqttPayloads.onAdUpdate,
    //   false,
    // );
    const postedAd = await adsService.createAd(reqBody);

    return apiResponse.success(res, req, postedAd);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

// exports.getAds = async (req, res) => {
//   /**
//    * @swagger
//    *
//    * /ads:
//    *   get:
//    *     security:
//    *       - auth: []
//    *     description: GET ads.
//    *     tags: [Ads]
//    *     produces:
//    *       - application/json
//    *     responses:
//    *       200:
//    *         description: success
//    */

//   try {
//     const loggedInUserOrg = req.user?.orgId;

//     const ads = await adsService.getAds({}, loggedInUserOrg);
//     return apiResponse.success(res, req, ads);
//   } catch (error) {
//     return apiResponse.fail(res, error.message, error.statusCode || 500);
//   }
// };

// exports.updateAd = async (req, res) => {
//   /**
//    * @swagger
//    *
//    * /ads/{adId}:
//    *   patch:
//    *     security:
//    *       - auth: []
//    *     description: update ads.
//    *     tags: [Ads]
//    *     consumes:
//    *       - multipart/form-data
//    *     parameters:
//    *       - name: adId
//    *         description: ad id of golf course
//    *         in: path
//    *         required: true
//    *         type: integer
//    *       - name: title
//    *         description: title of the ad
//    *         in: formData
//    *         required: false
//    *         type: string
//    *       - in: formData
//    *         name: adImage
//    *         description: Upload image of ads to be displayed
//    *         required: false
//    *         type: file
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
//     const form = new formidable.IncomingForm();

//     const { fields, files } = await new Promise((resolve, reject) => {
//       form.parse(req, (err, fields, files) => {
//         if (err) reject(err);
//         resolve({ fields, files });
//       });
//     });
//     const validation = new Validator(fields, {
//       title: "string",
//     });
//     if (validation.fails()) {
//       return apiResponse.fail(res, validation.errors);
//     }
//     const adImage = files.adImage;
//     const ad = await adsService.getAd({ id: adId }, loggedInUserOrg);
//     const courseId = ad.dataValues.gcId;
//     if (adImage) {
//       const smallImage = await upload_file.uploadImageForCourse(
//         adImage,
//         courseId,
//       );
//       fields.smallImage = smallImage;
//     }
//     const allowedFields = ["title", "smallImage"];
//     const filteredObject = validateObject(fields, allowedFields);
//     const reqBody = filteredObject;

//     const noOfRowsUpdated = await adsService.updateAd(
//       { id: adId },
//       reqBody,
//       loggedInUserOrg,
//     );

//     helper.mqtt_publish_message(
//       `gc/${ad.gcId}/screens`,
//       helper.mqttPayloads.onAdUpdate,
//       false,
//     );

//     return apiResponse.success(
//       res,
//       req,
//       noOfRowsUpdated ? "Ad updated successfully" : "Ad already up to date",
//     );
//   } catch (error) {
//     return apiResponse.fail(res, error.message, error.statusCode || 500);
//   }
// };

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
