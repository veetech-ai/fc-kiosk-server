// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../../common/api.response");
const helper = require("../../../common/helper");
const upload_file = require("../../../common/upload");
// Logger Imports
const courseService = require("../../../services/kiosk/course");
const adScreenService = require("../../../services/kiosk/advertisement_screen");
const adService = require("../../../services/kiosk/advertisement");
const organizationService = require("../../../services/organization");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Advertisements
 *   description: Advertisements API's
 */
exports.createAdvertisements = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-advertisements/{gcId}:
   *   post:
   *     security:
   *       - auth: []
   *     description: create advertisements.
   *     tags: [Kiosk-Advertisements]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: gcId
   *         description: ID of the golf course
   *         in: path
   *         required: true
   *         type: integer
   *       - name: title
   *         description: title
   *         in: formData
   *         required: true
   *         type: string
   *       - name: state
   *         description: state
   *         in: formData
   *         required: true
   *         type: string
   *       - name: smallImage
   *         description: Small Image
   *         in: formData
   *         required: false
   *         type: file
   *       - name: bigImage
   *         description: Big Image
   *         in: formData
   *         required: false
   *         type: file
   *       - name: screenId
   *         description: screen id
   *         in: formData
   *         required: false
   *         type: integer
   *       - name: tabLink
   *         description: tabLink
   *         in: formData
   *         required: false
   *         type: string
   *       - name: alternateLink
   *         description: alternateLink
   *         in: formData
   *         required: false
   *         type: string
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const gcId = req.params.gcId;
    const course = await courseService.getCourseById(gcId);

    const form = new formidable.IncomingForm();
    form.multiples = true;

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) {
          reject(err)
        }
        resolve({ fields, files });
      });
    }
    
    );

    const validation = new Validator(fields, {
      title: "required|string",
      screenId: "required|integer",
      state: "required|string",
      tabLink: "string",
      alternateLink: "string",
    });

    validation.fails(function () {
      return apiResponse.fail(res, validation.errors);
    });

    validation.passes(async function () {
      const smallImage = files?.smallImage;
      const bigImage = files?.bigImage;
      const smallImageLink = await upload_file.uploadImageForCourse(
        smallImage,
        gcId,
        "advertisement-images/",
        3,
      );
      const bigImageLink = await upload_file.uploadImageForCourse(
        bigImage,
        gcId,
        "advertisement-images/",
        3,
      );
      const reqBody = {
         ...fields,
         smallImage: smallImageLink,
         bigImage: bigImageLink,
         orgId: course.orgId
        };

      await adScreenService.getAdScreenById(reqBody.screenId);
      const ad = await adService.createAdvertisement(reqBody, gcId );
      return apiResponse.success(res, req, ad);
    });
  } catch (err) {
    return apiResponse.fail(res, err.message, err.statusCode || 500);
  }
};

exports.getAllAdvertisements = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-advertisements:
   *   get:
   *     security:
   *       - auth: []
   *     description: create advertisements.
   *     tags: [Kiosk-Advertisements]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {

    const allAds = await adService.getAllAdvertisements();

   

    return apiResponse.success(res, req, allAds);
  } catch (err) {
    return apiResponse.fail(res, err.message, err.statusCode || 500);
  }
};
