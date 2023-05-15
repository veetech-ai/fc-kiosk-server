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
 *   name: Kiosk-Shops
 *   description: Golf Course's Shops API's
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
    const course = await courseService.getCourseById(courseId);

    const loggedInUserOrgId = req.user.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    if (!isSuperOrAdmin && loggedInUserOrgId !== course.orgId) {
      return apiResponse.fail(res, "Course not Found", 404);
    }

    const shopImage = files?.image;
    const imageIdentifier = await upload_file.uploadImageForCourse(
      shopImage,
      courseId,
    );
    const reqBody = { ...fields, image: imageIdentifier };
    const courseShop = await courseShopsService.createCourseShop(
      reqBody,
      course.orgId,
    );

    const imageUrl = upload_file.getFileURL(courseShop.image);
    courseShop.setDataValue("image", imageUrl);

    return apiResponse.success(res, req, courseShop);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourseShops = async (req, res) => {
  /**
   * @swagger
   *
   * /course-shops/courses/{courseId}:
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
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    if (!isSuperOrAdmin && loggedInUserOrgId !== course.orgId) {
      return apiResponse.fail(res, "Course not Found", 404);
    }

    const courseShops = await courseShopsService.getCourseShops(courseId);

    return apiResponse.success(res, req, courseShops);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.updateCourseShop = async (req, res) => {
  /**
   * @swagger
   * /course-shops/{shopId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update shop for a golf course.
   *     tags: [Course-Shops]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - in: path
   *         name: shopId
   *         description: id of course
   *         required: true
   *         type: integer
   *       - name: name
   *         description: name of the shop
   *         in: formData
   *         required: false
   *         type: string
   *       - name: subheading
   *         description: subheading briefly describing the shop
   *         in: formData
   *         required: false
   *         type: string
   *       - name: description
   *         description: description of the shop
   *         in: formData
   *         required: false
   *         type: string
   *       - name: image
   *         in: formData
   *         description: Upload image of Golf course shop
   *         required: false
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
      name: "string",
      subheading: "string",
      description: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    const shopId = req.params.shopId;
    const courseShop = await courseShopsService.getCourseShopById(shopId);

    const loggedInUserOrgId = req.user.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    if (!isSuperOrAdmin && loggedInUserOrgId !== courseShop.orgId) {
      return apiResponse.fail(res, "Shop not Found", 404);
    }

    const reqBody = { ...fields };
    const shopImage = files?.image;
    if (shopImage) {
      const imageIdentifier = await upload_file.uploadImageForCourse(
        shopImage,
        courseShop.gcId,
      );
      reqBody.image = imageIdentifier;
    }
    const updatedCourseShop = await courseShopsService.updateCourseShop(
      shopId,
      reqBody,
    );

    if (updatedCourseShop) {
      const imageUrl = upload_file.getFileURL(updatedCourseShop.image);
      updatedCourseShop.setDataValue("image", imageUrl);
    }

    return apiResponse.success(res, req, updatedCourseShop);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.deleteCourseShop = async (req, res) => {
  /**
   * @swagger
   *
   * /course-shops/{shopId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: Delete shop.
   *     tags: [Course-Shops]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: shopId
   *         description: Organization ID
   *         in: path
   *         required: true
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const shopId = Number(req.params.shopId);
    if (!shopId) {
      return apiResponse.fail(res, "shopId must be a valid number");
    }

    const courseShop = await courseShopsService.getCourseShopById(shopId);

    const loggedInUserOrgId = req.user.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    if (!isSuperOrAdmin && loggedInUserOrgId !== courseShop.orgId) {
      return apiResponse.fail(res, "Shop not Found", 404);
    }

    await courseShopsService.deleteCourseShop(shopId);
    return apiResponse.success(res, req, "Shop Deleted");
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
