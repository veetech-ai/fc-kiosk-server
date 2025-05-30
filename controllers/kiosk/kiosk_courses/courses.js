// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");
const path = require("path");
const fs = require("fs");

// Common Imports
const apiResponse = require("../../../common/api.response");
const helper = require("../../../common/helper");
const upload_file = require("../../../common/upload");
const models = require("../../../models");
// Logger Imports
const courseService = require("../../../services/kiosk/course");
const tileService = require("../../../services/kiosk/tiles");
const awsS3 = require("../../../common/external_services/aws-s3");
const ServiceError = require("../../../utils/serviceError");
const config = require("../../../config/config");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses
 *   description: Courses API's
 */
exports.create_courses = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses:
   *   post:
   *     security:
   *       - auth: []
   *     description: create golf course (Only Admin).
   *     tags: [Kiosk-Courses]
   *     consumes:
   *       - application/x-www-form-urlencoded
   *     parameters:
   *       - name: name
   *         description: name of the golf course
   *         in: formData
   *         required: true
   *         type: string
   *       - name: state
   *         description: state in which golf course exist
   *         in: formData
   *         required: true
   *         type: string
   *       - name: city
   *         description: city in which golf course exist
   *         in: formData
   *         required: true
   *         type: string
   *       - name: zip
   *         description: zip
   *         in: formData
   *         required: false
   *         type: string
   *       - name: phone
   *         description: contact of golf course
   *         in: formData
   *         required: false
   *         type: string
   *       - name: orgId
   *         description: organization id to be linked to
   *         in: formData
   *         required: true
   *         type: integer
   *       - in: formData
   *         name: defaultSuperTileImage
   *         description: Default super tile image to be used for tiles, when their superTileImage is not uploaded
   *         required: true
   *         type: file
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */
  const transact = await models.sequelize.transaction();
  try {
    const form = new formidable.IncomingForm();

    let fields, files;
    if (req.is("multipart/form-data")) {
      ({ fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) {
            reject(new ServiceError(err.message, 400));
          }

          resolve({ fields, files });
        });
      }));
    } else {
      fields = req.body;
      files = {};
    }

    const validation = new Validator(fields, {
      name: "required|string",
      state: "required|string",
      city: "required|string",
      defaultSuperTileImage: "string",
      street: "string",
      zip: "string",
      phone: "string",
      orgId: "required|integer",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    let { defaultSuperTileImage: defaultSuperTileImageFile } = files;

    if (!defaultSuperTileImageFile) {
      const defaultSuperTileFilePath = path.join(
        __dirname,
        "../../../assets/defaultsupertileimage.jpeg",
      );

      if (fs.existsSync(defaultSuperTileFilePath) && config.env !== "test") {
        const superTileFile = helper.createFormidableFileObject(
          defaultSuperTileFilePath,
        );

        if (superTileFile) defaultSuperTileImageFile = superTileFile;
      }
    }

    const allowedTypes = ["jpg", "jpeg", "png", "webp"];
    if (defaultSuperTileImageFile)
      fields.defaultSuperTileImage = await upload_file.upload_file(
        defaultSuperTileImageFile,
        `uploads/tiles`,
        allowedTypes,
      );

    const {
      name,
      state,
      city,
      street,
      zip,
      phone,
      orgId,
      defaultSuperTileImage,
    } = fields;
    const reqBody = {
      name,
      state,
      city,
      street,
      zip,
      phone,
      defaultSuperTileImage,
    };

    reqBody.ghin_url = "https://www.ghin.com/login";

    const course = await courseService.createCourse(reqBody, orgId);

    if (course.defaultSuperTileImage) {
      course.defaultSuperTileImage = upload_file.getFileURL(
        course.defaultSuperTileImage,
      );
    }

    // using one service inside another, and other way round as well causes circluar dependency issue
    // so multi service stuff should be handled inside controller
    const tiles = await tileService.getCourseTiles(course.id);
    await transact.commit();

    return apiResponse.success(res, req, { ...course.dataValues, tiles });
  } catch (error) {
    await transact.rollback();
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
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
   *         name: defaultSuperTileImage
   *         description: Default super tile image to be used for tiles, when their superTileImage is not uploaded
   *         required: false
   *         type: file
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

    const loggedInUserOrg = req.user?.orgId;

    const course = await courseService.getCourse(
      { id: courseId },
      loggedInUserOrg,
    );

    const form = new formidable.IncomingForm();
    form.multiples = true;
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const validationRules = {
      name: "string",
      defaultSuperTileImage: "string",
      holes: "integer",
      par: "par",
      slope: "slope",
      content: "string",
      email: "string",
      yards: "yards",
      year_built: "year_built",
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
    };

    const validation = new Validator(fields, validationRules);

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }

    let reqBody = {};
    const uploadedImages = [];
    const uploadedImageFiles = [];
    const logoImage = files?.logo;
    const defaultSuperTileImageFile = files?.defaultSuperTileImage;
    let courseImages = files?.course_images;
    let parsedRemovedUuidList;

    if (fields?.order && fields?.links) {
      // whenever course images are uploaded fields.order will always be there
      const parsedOrder = JSON.parse(fields.order);
      const parsedUuidList = JSON.parse(fields.links);

      if (fields?.removedUUIDs) {
        parsedRemovedUuidList = JSON.parse(fields.removedUUIDs);
      }

      if (courseImages) {
        const isIterable = Symbol.iterator in Object(courseImages);
        if (!isIterable) {
          uploadedImageFiles.push(courseImages);
          courseImages = [...uploadedImageFiles];
        }
      }

      for await (const uploadType of parsedOrder) {
        let fileAccordingToOrder;
        if (uploadType === "L") {
          fileAccordingToOrder = parsedUuidList.shift();
        } else if (uploadType === "F") {
          const fileToBeUploaded = courseImages.shift();
          if (fileToBeUploaded) {
            fileAccordingToOrder = await upload_file.uploadCourseImage(
              fileToBeUploaded,
              courseId,
            );
          }
        }

        uploadedImages.push(fileAccordingToOrder);
      }

      fields.images = uploadedImages;
      if (parsedRemovedUuidList && parsedRemovedUuidList.length) {
        await upload_file.deleteImageForCourse(parsedRemovedUuidList);
      }
      const { order, links, ...restFields } = fields;
      reqBody = { ...restFields };
    }

    if (logoImage) {
      if (course.logo) {
        await awsS3.deleteObject(course.logo);
      }
      const logo = await upload_file.uploadCourseImage(logoImage, courseId);
      reqBody.logo = logo;
    }

    const allowedTypes = ["jpg", "jpeg", "png", "webp"];
    if (defaultSuperTileImageFile) {
      fields.defaultSuperTileImage = await upload_file.upload_file(
        defaultSuperTileImageFile,
        `uploads/tiles`,
        allowedTypes,
      );
    }

    reqBody = { ...reqBody, ...fields };
    const updatedCourse = await courseService.createCourseInfo(
      reqBody,
      courseId,
    );
    if (updatedCourse) {
      helper.mqtt_publish_message(
        `gc/${courseId}/screens`,
        helper.mqttPayloads.onCourseInfoUpdate,
        false,
      );
    }
    return apiResponse.success(res, req, updatedCourse);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.getCourseInfo = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/{courseId}/course-info:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get course info for specific course.
   *     tags: [Kiosk-Courses]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: courseId
   *         description: Course ID
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
    const loggedInUserOrg = req.user?.orgId;
    const course = await courseService.getCourse(
      { id: courseId },
      loggedInUserOrg,
    );

    if (course.logo) {
      const logo = upload_file.getFileURL(course.logo);
      course.setDataValue("logo", logo);
    }
    if (course.images) {
      const images = upload_file.getFileURL(course.images);
      course.setDataValue("images", images);
    }

    if (course.defaultSuperTileImage) {
      const defaultSuperTileImage = upload_file.getFileURL(
        course.defaultSuperTileImage,
      );
      course.setDataValue("defaultSuperTileImage", defaultSuperTileImage);
    }

    return apiResponse.success(res, req, course);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.getCourses = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses:
   *   get:
   *     security:
   *       - auth: []
   *     description: Get course info for specific course.
   *     tags: [Kiosk-Courses]
   *     produces:
   *       - application/json
   *     parameters:
   *       - name: state
   *         description: state of course
   *         in: query
   *         required: false
   *         type: string
   *     responses:
   *       200:
   *         description: Success
   */

  try {
    const where = {};
    let courses = [];
    if (req.query.state) {
      where.state = req.query.state.toLowerCase();
    }
    courses = await courseService.getCourses(where);
    return apiResponse.success(res, req, courses);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
