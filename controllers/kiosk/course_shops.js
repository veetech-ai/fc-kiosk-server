// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../common/api.response");
const helper = require("../../common/helper");
const upload_file = require("../../common/upload");
// Logger Imports
const courseService = require("../../services/kiosk/course");
const courseShopsService = require("../../services/kiosk/course_shops");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses
 *   description: Courses API's
 */
exports.createCourseShop = async (req, res) => {
  /**
   * @swagger
   *
   * /course-shops:
   *   post:
   *     security:
   *       - auth: []
   *     description: create golf course Shop.
   *     tags: [Course-Shops]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: gcId
   *         description: golf course for which shop is being created
   *         in: formData
   *         required: true
   *         type: integer
   *       - name: name
   *         description: name of the shop
   *         in: formData
   *         required: true
   *         type: string
   *       - name: subheading
   *         description: subheading briefly describing the shop
   *         in: formData
   *         required: true
   *         type: string
   *       - name: description
   *         description: description of the shop
   *         in: formData
   *         required: true
   *         type: string
   *       - name: image
   *         in: formData
   *         description: Upload image of Golf course shop
   *         required: true
   *         type: file
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
      name: "required|string",
      subheading: "required|string",
      description: "required|string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const courseId = fields.gcId;
    const course = await courseService.getCourseById(courseId)
     
    const loggedInUserOrgId = req.user.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, ["super", "admin"]).success;
    if(!isSuperOrAdmin && loggedInUserOrgId !== course.orgId){
      return apiResponse.fail(res, "Course not Found", 404);
    }

    const shopImage = files?.image;
    const imageIdentifier = await upload_file.uploadImageForCourse(shopImage, courseId);
    const reqBody = { ...fields, image: imageIdentifier }
    const courseShop = await courseShopsService.createCourseShop(reqBody, course.orgId)
    
    if(courseShop) {
        const imageUrl = upload_file.getFileURL(courseShop.image);
        courseShop.setDataValue("image", imageUrl)
    }

    return apiResponse.success(res, req, courseShop);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseShops = async (req, res) => {
  /**
   * @swagger
   *
   * /course-shops/course/{courseId}:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get shops for a specific course.
   *     tags: [Course-Shops]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: courseId
   *         description: Golf Course ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const courseId = Number(req.params.courseId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }

    const course = await courseService.getCourseById(courseId);

    const loggedInUserOrgId = req.user.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, ["super", "admin"]).success;
    if(!isSuperOrAdmin && loggedInUserOrgId !== course.orgId){
      return apiResponse.fail(res, "Course not Found", 404);
    }

    const courseShops = await courseShopsService.getCourseShops(courseId)

    return apiResponse.success(res, req, courseShops);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateCourseShops = async (req, res) => {
  /**
   * @swagger
   * /course-shops/{courseId}/course-info:
   *   patch:
   *     security:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Course-Shops]
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

exports.deleteCourseShop = async (req, res) => {
    /**
     * @swagger
     *
     * /course-shops/{orgId}:
     *   get:
     *     security:
     *       - auth: []
     *     description: Get courses for a specific organization.
     *     tags: [Course-Shops]
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
