const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const courseService = require("../../services/kiosk/course");
const adsService = require("../../services/kiosk/ads");
const screenConfigService = require("../../services/screenConfig/screens");
const helper = require("../../common/helper");
const { validateObject } = require("../../common/helper");

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
    const courseId = fields.gcId;
    const course = await courseService.getCourse(
      { id: courseId },
      loggedInUserOrg,
    );
    const adImage = files.adImage;
    const screens = await screenConfigService.getScreensByCourses(courseId);
    const { updatedAt, orgId, gcId, id, createdAt, ...restFields } =
      screens.dataValues;
    const screensList = { ...restFields };
    const trueKeys = Object.keys(screensList).filter(
      (key) => screensList[key] === true,
    );
    const smallImage = await upload_file.uploadImageForCourse(
      adImage,
      courseId,
    );
    const allowedFields = ["gcId", "state", "title"];
    const filteredObject = validateObject(fields, allowedFields);
    const reqBody = { ...filteredObject, smallImage, orgId, screens: trueKeys };
    const postedAd = await adsService.createAd(reqBody, orgId);
    return apiResponse.success(res, req, postedAd);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getAds = async (req, res) => {
  /**
   * @swagger
   *
   * /ads/courses/{courseId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: CREATE ads.
   *     tags: [Ads]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: courseId
   *         description: id of golf course
   *         in: path
   *         required: true
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const loggedInUserOrg = req.user?.orgId;

    
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    const course = await courseService.getCourse(
      { id: courseId },
      loggedInUserOrg,
    );

    const ads = await adsService.getAds(courseId);
    return apiResponse.success(res, req, ads);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
