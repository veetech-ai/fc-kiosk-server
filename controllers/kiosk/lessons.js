const Validator = require("validatorjs");
const formidable = require("formidable");
const apiResponse = require("../../common/api.response");
const upload_file = require("../../common/upload");
const courseLesson = require("../../services/kiosk/lessons");
const courseService = require("../../services/kiosk/course");
const helper = require("../../common/helper");

/**
 * @swagger
 * tags:
 *   name: Courses-Lesson
 *   description: Web Portal Courses API's
 */
exports.create_lesson = async (req, res) => {
  /**
   * @swagger
   *
   * /course-lesson:
   *   post:
   *     security:
   *       - auth: []
   *     description: CREATE golf course lessons (Only Admin).
   *     tags: [Courses-Lesson]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: gcId
   *         description: id of golf course
   *         in: formData
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
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const form = new formidable.IncomingForm();
    form.multiples = true;
    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve({ fields, files });
      });
    });
    const validation = new Validator(fields, {
      gcId: "integer",
      name: "string",
      title: "string",
      content: "string",
      timings: "string",
    });
    if (validation.fails()) {
      return apiResponse.fail(res, validation.errors);
    }
    const courseId = fields.gcId;
    const course = await courseService.getCourseById(courseId);
    const orgId = course.orgId;
    const isSameOrganizationResource = loggedInUserOrg === orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }
    const coachImage = files.coachImage;

    const image = await upload_file.uploadImageForCourse(
      coachImage,
      courseId,
      "coach-images/",
      3,
    );

    const reqBody = { ...fields, image };
    const coach = await courseLesson.createLesson(reqBody, orgId);
    return apiResponse.success(res, req, coach);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
exports.update_lesson = async (req, res) => {
  /**
   * @swagger
   *
   * /course-lesson/{lessonId}:
   *   patch:
   *     security:
   *       - auth: []
   *     description: update golf course lessons (Only Admin).
   *     tags: [Courses-Lesson]
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
    const loggedInUserOrg = req.user?.orgId;
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const lessonId = Number(req.params.lessonId);
    if (!lessonId) {
      return apiResponse.fail(res, "lessonId must be a valid number");
    }
    const lesson = await courseLesson.findLessonById(lessonId);
    const isSameOrganizationResource = loggedInUserOrg === lesson.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
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
    let image;
    if (coachImage) {
      image = await upload_file.uploadImageForCourse(
        coachImage,
        lessonId,
        "coach-images/",
        3,
      );
    }
    const reqBody = { ...fields, image };
    const updatedCoach = await courseLesson.updateLesson(reqBody, lessonId);
    return apiResponse.success(res, req, updatedCoach);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};

exports.delete_lesson = async (req, res) => {
  /**
   * @swagger
   *
   * /course-lesson/{lessonId}:
   *   delete:
   *     security:
   *       - auth: []
   *     description: delete specific lesson.
   *     tags: [Courses-Lesson]
   *     consumes:
   *       - multipart/form-data
   *     parameters:
   *       - name: lessonId
   *         description: id of lesson
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
    const isSuperOrAdmin = helper.hasProvidedRoleRights(req.user.role, [
      "super",
      "admin",
    ]).success;
    const lessonId = Number(req.params.lessonId);
    if (!lessonId) {
      return apiResponse.fail(res, "lessonId must be a valid number");
    }
    const lesson = await courseLesson.findLessonById(lessonId);
    const isSameOrganizationResource = loggedInUserOrg === lesson.orgId;
    if (!isSuperOrAdmin && !isSameOrganizationResource) {
      return apiResponse.fail(res, "", 403);
    }

    const deletedLesson = await courseLesson.deleteLessonById(lessonId);
    return apiResponse.success(res, req, deletedLesson);
  } catch (error) {
    return apiResponse.fail(res, error.message, error.statusCode || 500);
  }
};
