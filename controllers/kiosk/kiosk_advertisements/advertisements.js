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
const organizationService = require("../../../services/organization")

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
   *       - name: orgId
   *         description: orgId of the golf course
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: name
   *         description: name
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
   *         type: integer
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

  const gcId = req.params.gcId;
  await courseService.getCourseById(gcId);

  const form = new formidable.IncomingForm();
  form.multiples = true;
  const { fields, files } = await new Promise((resolve, reject) => {
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });

  const validation = new Validator(fields, {
    name: "required|string",
    orgId: "required|integer",
    screenId: "required|integer",
    tabLink: "string",
    alternateLink: "string"
  });

  
  validation.fails(function () {
    return apiResponse.fail(res, validation.errors);
  });

  validation.passes(async function () {
    try {
      console.log("reqBody")
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
        3
      );

      const reqBody = { ...fields, smallImageLink, bigImageLink };

      await adScreenService.getAdScreenById(reqBody.screenId)

      const organization = await organizationService.findById(reqBody.orgId);
      if (!organization)
        return apiResponse.fail(res, "Organization not found", 404);

      console.log("REQ",reqBody)

      await adService.createAdvertisement(reqBody,reqBody.orgId,gcId)

      // const updatedCourse = await courseService.createCourseInfo(
      //   reqBody,
      //   gcId,
      // );

      return apiResponse.success(res, req, reqBody);
    } catch (err) {
      return apiResponse.fail(res, err.message, err.statusCode || 500);
    }
  });
};
exports.get_courses_for_organization = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/{orgId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get courses for a specific organization.
   *     tags: [Kiosk-Courses]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: orgId
   *         description: Organization ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const orgId = Number(req.params.orgId);
    if (!orgId) {
      return apiResponse.fail(res, "orgId must be a valid number");
    }
    const courses = await courseService.getCoursesByOrganization(orgId);
    return apiResponse.success(res, req, courses);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.create_course_info = async (req, res) => {
  /**
   * @swagger
   * /kiosk-courses/{courseId}/course-info:
   *   patch:
   *     security:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Kiosk-Courses]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: path
   *         name: courseId
   *         description: id of course
   *         required: true
   *         type: integer
   *       - in: formData
   *         name: name
   *         description: name of course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: holes
   *         description: Holes of the golf course
   *         required: false
   *         type: integer
   *         enum: [9, 18]
   *       - in: formData
   *         name: par
   *         description: par of golf course
   *         required: false
   *         type: integer
   *       - in: formData
   *         name: yards
   *         description: length of golf course in yards
   *         required: false
   *         type: integer
   *       - in: formData
   *         name: slope
   *         description: slope of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: content
   *         description: description of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: email
   *         description: email of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: year_built
   *         description: Year in which the course was built
   *         required: false
   *         type: integer
   *       - in: formData
   *         name: architects
   *         description: architects of golf course (CSV)
   *         required: false
   *         type: string
   *       - in: formData
   *         name: greens
   *         description: name of the greens of golf course (CSV)
   *         required: false
   *         type: string
   *       - in: formData
   *         name: fairways
   *         description: fairways of golf course (CSV)
   *         required: false
   *         type: string
   *       - in: formData
   *         name: members
   *         description: members of golf course (eg 500+)
   *         required: false
   *         type: string
   *       - in: formData
   *         name: season
   *         description: season of golf course (e.g. Year Round)
   *         required: false
   *         type: string
   *       - in: formData
   *         name: phone
   *         description: phone number of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: country
   *         description: country of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: state
   *         description: state of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: zip
   *         description: zip of golf course
   *         required: false
   *         type: integer
   *       - in: formData
   *         name: city
   *         description: city of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: long
   *         description: long of golf course
   *         required: false
   *         type: number
   *         format: float
   *       - in: formData
   *         name: lat
   *         description: lat  of golf course
   *         required: false
   *         type: number
   *         format: float
   *       - in: formData
   *         name: street
   *         description: street of golf course
   *         required: false
   *         type: string
   *       - in: formData
   *         name: logo
   *         description: Upload logo of Golf course
   *         required: false
   *         type: file
   *       - in: formData
   *         name: course_images
   *         description: Images of the golf course
   *         required: false
   *         type: array
   *         items:
   *           type: file
   *         collectionFormat: multi
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    const validation = new Validator(req.body, {
      name: "string",
      holes: "integer",
      par: "integer",
      slope: "integer",
      content: "string",
      email: "string",
      yards: "integer",
      year_built: "integer",
      architects: "string",
      greens: "string",
      fairways: "string",
      members: "string",
      season: "string",
      phone: "string",
      country: "string",
      state: "string",
      zip: "integer",
      city: "string",
      long: "numeric",
      lat: "numeric",
      street: "string",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const form = new formidable.IncomingForm();
    form.multiples = true;
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });

    const logoImage = files?.logo;
    const courseImages = files?.course_images;
    const logo = await upload_file.uploadCourseImage(logoImage, courseId, 3);
    const images = await upload_file.uploadCourseImages(
      courseImages,
      courseId,
      3,
    );

    const reqBody = { ...fields, logo, images };
    const updatedCourse = await courseService.createCourseInfo(
      reqBody,
      courseId,
    );
    return apiResponse.success(res, req, updatedCourse);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
