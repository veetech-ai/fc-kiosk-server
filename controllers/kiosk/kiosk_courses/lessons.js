// External Module Imports
const Validator = require("validatorjs");
const formidable = require("formidable");

// Common Imports
const apiResponse = require("../../../common/api.response");
const helper = require("../../../common/helper");
const upload_file = require("../../../common/upload");
// Logger Imports
const courseLesson = require("../../../services/kiosk/lessons");
const courseService = require("../../../services/kiosk/course");

/**
 * @swagger
 * tags:
 *   name: Kiosk-Courses
 *   description: Web Portal Courses API's
 */
exports.create_lesson = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/{orgId}/{courseId}/lesson:
   *   post:
   *     security:
   *       - auth: []
   *     description: CREATE golf course lessons (Only Admin).
   *     tags: [Kiosk-Courses]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: courseId
   *         description: id of golf course
   *         in: path
   *         required: true
   *         type: integer
   *       - name: orgId
   *         description: organization id of golf course
   *         in: path
   *         required: true
   *         type: integer
   *       - name: name
   *         description: name of the coach
   *         in: formData
   *         required: false
   *         type: string
   *       - name: title
   *         description: title of the coach
   *         in: formData
   *         required: false
   *         type: string
   *       - name: content
   *         description: description of coach
   *         in: formData
   *         required: false
   *         type: string
   *       - name: timings
   *         description: availability if coach
   *         in: formData
   *         required: false
   *         type: string
   *       - in: formData
   *         name: coachImage
   *         description: Upload image of Coach of Golf course
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
    const isSuperOrAdmin = req.user?.role?.super || req.user?.role?.admin;

    const courseId = Number(req.params.courseId);
    const orgId = Number(req.params.orgId);
    if (!courseId) {
      return apiResponse.fail(res, "courseId must be a valid number");
    }
    if (!orgId) {
      return apiResponse.fail(res, "orgId must be a valid number");
    }
    const isSameOrganizationResource = loggedInUserOrg === orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource)
      return apiResponse.fail(res, "", 403);
    const isLinked = await courseService.getLinkedCourse(courseId, orgId);
    console.log(!isLinked);
    if (isLinked) {
      const form = new formidable.IncomingForm();
      form.multiples = true;
      const { fields, files } = await new Promise((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve({ fields, files });
        });
      });
      const validation = new Validator(fields, {
        name: "string",
        title: "string",
        content: "string",
        timings: "string",
      });
      if (validation.fails()) {
        return apiResponse.fail(res, validation.errors);
      }
      const coachImage = files.coachImage;
      const image = await upload_file.uploadImage(
        coachImage,
        courseId,
        3,
        "coach-images/",
      );
      const reqBody = { ...fields, image };
      const coach = await courseLesson.createCoach(reqBody, courseId, orgId);
      return apiResponse.success(res, req, coach);
    }
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.update_lesson = async (req, res) => {
  /**
   * @swagger
   *
   * /kiosk-courses/lesson/{lessonId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update golf course lessons (Only Admin).
   *     tags: [Kiosk-Courses]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: lessonId
   *         description: id of lesson
   *         in: path
   *         required: true
   *         type: integer
   *       - name: name
   *         description: name of the coach
   *         in: formData
   *         required: false
   *         type: string
   *       - name: title
   *         description: title of the coach
   *         in: formData
   *         required: false
   *         type: string
   *       - name: content
   *         description: description of coach
   *         in: formData
   *         required: false
   *         type: string
   *       - name: timings
   *         description: availability if coach
   *         in: formData
   *         required: false
   *         type: string
   *       - in: formData
   *         name: coachImage
   *         description: Upload image of Coach of Golf course
   *         required: false
   *         type: file
   *     produces:
   *       - application/json
   *     responses:
   *       200:
   *         description: success
   */

  try {
    const lessonId = Number(req.params.lessonId);
    if (!lessonId) {
      return apiResponse.fail(res, "lessonId must be a valid number");
    }
    const form = new formidable.IncomingForm();
    form.multiples = true;
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const validation = new Validator(fields, {
      name: "string",
      title: "string",
      content: "string",
      timings: "string",
    });

    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const coachImage = files.coachImage;
    const image = await upload_file.uploadImage(
      coachImage,
      lessonId,
      3,
      "coach-images/",
    );
    const reqBody = { ...fields, image };
    const updatedCoach = await courseLesson.updateCoach(reqBody, lessonId);
    return apiResponse.success(res, req, updatedCoach);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
